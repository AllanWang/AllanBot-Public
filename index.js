'use strict';
var f = require('./src/firebase');
var v = require('./src/globalVariables');
var log = require("npmlog");

var ab = [
    'basic',
    'endlessTalk',
    'saveText',
    'chatColour',
    'quickNotifications',
    'userTimeout',
    'remind',
    'nickname',
    'indirect',
    'translate',
    'onOff',
    'superuser',
    'help',
    'chatTitle',
    'quote',
    'chatEmoji',
    'spam',
    'echo'
]

ab.map(function(sub) {
    if (sub != 'basic') { //basic is not a valid boolean
        v.b[sub] = false; //add all other ab values to the boolean map
    }
    ab[sub] = require('./src/' + sub);
});

///FACEBOOK API STUFF - will be changed via setOptions
var api;

//Extra permissions
var masterArray = [];
var devArray = [];
var firstRun = true;

var extraOptions = [ //all of these values must be under globalVariables as well
    'myID', 'myName', 'botID', 'ignoreArray'
]

function setOptions(options) {
    Object.keys(options).map(function(key) {
        switch (key) {
            case 'logLevel':
                log.level = options.logLevel;
                break;
            case 'botName':
                setBotName(options.botName.toString());
                break;
            case 'api':
                api = options.api;
                break;
            case 'pandoraID':
                ab.basic.enablePandora(options.pandoraID.toString());
                break;
            case 'firebase':
                f.initializeFirebase(options.firebase);
                f.setBase(options.firebase);
                break;
            case 'masterArray':
                masterArray = options.masterArray;
                break;
            case 'devArray':
                devArray = options.devArray;
                break;
            default:
                if (extraOptions.indexOf(key) != -1) {
                    v[key] = options[key];
                } else {
                    log.warn('Unrecognized option given to setOptions', key);
                }
                break;
        }
    });
    if (!api) log.warn('API not received; nothing will work.');
    v.botID = parseInt(api.getCurrentUserID());
    if (!v.botName) {
        api.getUserInfo(v.botID, function(err, ret) {
            if (!err) {
                setBotName(ret[v.botID].firstName);
            } else {
                log.error('Setting bot name failed', err);
            }
        });
    }
    if (!v.myID) log.warn('ID not set; a few things won\'t work.');
    if (!v.contains(v.ignoreArray, v.botID)) v.ignoreArray.unshift(v.botID);
    if (!v.firebaseOn) log.warn('Firebase is not set; a lot of features will not work');
    log.info('--------------------\n     Welcome ' + v.botName + '\n     --------------------');
}

function setBotName(s) {
    v.botName = s;
    v.botNameLength = s.length;
    v.botNameL = s.toLowerCase();
}

function enableFeatures(options) {
    Object.keys(options).map(function(key) {
        switch (key) {
            case 'everything':
                for (var b in v.b) {
                    if (b == 'spam') continue;
                    v.b[b] = options.everything;
                }
                break;
            case 'reminders':
                v.b.remind = options.reminders;
                break;
            default:
                if (key in v.b) {
                    v.b[key] = options[key];
                } else {
                    log.warn('Unrecognized option given to enableFeatures', key);
                }
                break;
        }
    });
    if (!api) {
        log.warn('Api not set! Make sure you add it via setOptions prior to enabling bot features');
        return;
    }
    if (firstRun) { ///first run, in case you use enableFeatures multiple times
        firstRun = false;
        if (v.b.notifyMention) {
            if (!v.myID || !v.myName) {
                log.warn('notifyMention disabled; make sure you have set your name and ID');
                v.b.notifyMention = false;
            }
        }
        if (v.b.spam) log.info('Spam is enabled; this is only for those with devMode');
        if (v.b.userTimeout) ab.userTimeout.afterRestart(api);
        if (v.b.remind) {
            setTimeout(function() {
                ab.remind.getScheduledMessages();
            }, 3000);
            setTimeout(function() {
                ab.remind.checkTimeNotification(api);
            }, 5000);
            setInterval(function() {
                v.nextScheduledMessageNotif = true;
            }, 500000);
            setInterval(function() {
                if (!v.b.remind) return;
                ab.remind.checkTimeNotification(api);
            }, 50000);
        }
    }
    // console.log(JSON.stringify(v.b));
}


function listen(message) {
    if (!message.body) { //no text
        return;
    }

    v.continue = true;

    v.godMode = v.contains(masterArray, message.senderID);
    if (v.godMode) {
        log.info('user has godMode');
    }
    v.devMode = v.contains(devArray, message.senderID) || v.godMode;
    if (v.devMode && !v.godMode) {
        log.info('user has devMode');
    }

    //continue independent isteners go here

    if (v.b.superuser) ab.superuser.commands(api, message);

    if (message.senderID == v.botID) return; //stop listening to bot

    if (v.b.quickNotifications) ab.quickNotifications.notifyData(api, message); //sends notification if it exists

    if (v.b.notifyMention) ab.basic.notifyMention(api, message); //notifies main user on mention

    if (v.b.indirect) {
        ab.indirect.messageInWaiting(api, message);
        ab.indirect.saveConversationList(api, message);
    }

    //input independent listeners

    if (v.continue && v.b.chatColour) ab.chatColour.listener(api, message);
    if (v.continue && v.b.help) ab.help.specific(api, message);

    if (!v.continue) return; //done going through first group of listeners

    if (message.threadID == v.myID) {
        if (v.b.indirect) {
            ab.indirect.distantMessages(api, message);
            if (message.body == '--map') ab.indirect.printConvoMap(api);
        }
    }

    //input checker
    var input = '';
    if (message.isGroup) {
        if ((message.body.toLowerCase().slice(0, v.botNameLength + 2) == '@' + v.botNameL + ' ') && message.body.length > (v.botNameLength + 2)) {
            input = message.body.slice(v.botNameLength + 2);
        }
    } else if (!v.contains(v.ignoreArray, message.threadID)) { //make sure it isn't a one on one convo with a bot
        input = message.body;
    }

    //godMode stuff

    if (v.godMode) {
        if (v.continue && v.b.onOff) ab.onOff.listener(api, message, message.body);
        if (v.continue && v.b.endlessTalk) ab.endlessTalk.listener(api, message, message.body);
        if (v.continue) ab.basic.muteToggle(api, message);

        if (!v.continue) return;
    }

    //global stuff

    // if (v.godMode) log.info('checking input');

    //check if disabled after master functions and listeners run
    if (v.b.onOff) ab.onOff.check(api, message);

    if (v.b.endlessTalk) ab.endlessTalk.inAction(api, message); //should be disabled if offline

    //Input stuff goes here

    if (input) {
        log.info('Input', input);

        if (v.continue) ab.basic.respondSwitch(api, message, input);
        if (v.continue && v.b.chatColour) ab.chatColour.change(api, message, input);
        if (v.continue && v.b.chatEmoji) ab.chatEmoji.listener(api, message, input);
        if (v.continue && v.b.chatTitle) ab.chatTitle.listener(api, message, input);
        if (v.continue && v.b.echo) ab.echo.listener(api, message, input);
        if (v.continue && v.b.endlessTalk) ab.endlessTalk.listener(api, message, input);
        if (v.continue && v.b.help) ab.help.listener(api, message, input);
        if (v.continue && v.b.nickname) ab.nickname.listener(api, message, input);
        if (v.continue && v.b.quickNotifications) ab.quickNotifications.listener(api, message, input);
        if (v.continue && v.b.quote) ab.quote.listener(api, message, input);
        if (v.continue && v.b.remind) ab.remind.listener(api, message, input);
        if (v.continue && v.b.saveText) ab.saveText.listener(api, message, input);
        if (v.continue && v.b.spam) ab.spam.listener(api, message, input);
        if (v.continue && v.b.translate) ab.translate.listener(api, message, input);

        //response listener must be last
        if (v.continue && v.b.talkBack) ab.basic.respondRequest(api, message, input);
    }
}

module.exports = {
    //The essential functions
    ab: ab,
    setOptions: setOptions,
    enableFeatures: enableFeatures,
    listen: listen,
    //The behind the scene files that can be used by other developers
    allanbotSub: ab,
    firebase: f,
    v: v
}
