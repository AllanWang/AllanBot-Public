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
    'quote'
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

    //Listeners go here
    if (v.b.superuser) ab.superuser.commands(api, message);
    if (message.senderID == v.botID) return; //stop listening to bot

    if (v.b.quickNotifications) ab.quickNotifications.notifyData(api, message); //sends notification if it exists

    if (v.b.notifyMention) ab.basic.notifyMention(api, message); //notifies main user on mention

    if (v.b.indirect) {
        ab.indirect.messageInWaiting(api, message);
        ab.indirect.saveConversationList(api, message);
    }

    var count1 = -1;
    listeners:
        while (v.continue) {
            count1++;
            switch (count1) {
                case 0:
                    if (v.b.chatColour) ab.chatColour.listener(api, message);
                    break;
                case 1:
                    if (v.b.help) ab.help.specific(api, message);
                    break;
                default:
                    break listeners;
            }
        }

    if (!v.continue) return;

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
        var count2 = -1;
        masterFeatures:
            while (v.continue) {
                count2++;
                switch (count2) {
                    case 0:
                        if (v.b.onOff) ab.onOff.listen(api, message, message.body);
                    case 1:
                        if (v.b.endlessTalk) ab.endlessTalk.set(api, message);
                        break;
                    case 2:
                        ab.basic.muteToggle(api, message);
                        break;
                    default:
                        break masterFeatures;
                }
            }
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

        var count3 = -1;
        while (v.continue) {
            count3++;
            switch (count3) {
                case 0:
                    if (v.b.help && input.length < 8 && v.contains(input, 'help')) ab.help.menu(api, message);
                    break;
                case 1:
                    if (v.b.saveText) {
                        if (input.slice(0, 7) == '--save ' && input.length > 7) {
                            ab.saveText.save(api, message, input.slice(7));
                            v.continue = false;
                        } else if (input == '--saved') {
                            ab.saveText.get(api, message);
                            v.continue = false;
                        } else if (input == '--erase') {
                            f.setData(api, message, v.f.Saved.child(message.threadID).child(message.senderID), null, 'Erased saved text');
                            v.continue = false;
                        }
                    }
                    break;
                case 2:
                    if (v.b.quickNotifications) {
                        if (input.toLowerCase() == '--eqn') {
                            f.setData(api, message, v.f.QN.child(message.senderID), true,
                                'Quick notifications enabled.\nYou only need to do this once until you disable it.');
                            v.continue = false;
                        } else if (input.toLowerCase() == '--dqn') {
                            f.setData(api, message, v.f.QN.child(message.senderID), null, 'Quick notifications disabled.');
                            v.continue = false;
                        }
                    }
                    break;
                case 3:
                    if (v.b.spam && input == '--spam') {
                        if (v.devMode) {
                            ab.basic.spam(api, message);
                        } else {
                            api.sendMessage('You do not have the power to do this.', message.threadID);
                        }
                        v.continue = false;
                    }
                    break;
                case 4:
                    if (v.b.chatTitle) ab.chatTitle.set(api, message, input);
                    break;
                case 5:
                    if (v.b.echo && input.slice(0, 7) == '--echo ' && input.length > 7) {
                        var s = input.slice(7);
                        if (!v.godMode) { //TODO add these things
                            if (s.slice(0, 1) == '$') {
                                api.sendMessage('You cannot run commands via echoing', message.threadID); //this is designated for my superuse commands (commands done by the bot) - It is not added
                                v.continue = false;
                            } else if (s.slice(0, v.botNameLength + 1).toLowerCase() == '@' + v.botNameL) {
                                api.sendMessage("I don't want to echo myself.", message.threadID);
                                v.continue = false;
                            }
                        }
                        ab.basic.echo(api, message, s);
                    }
                    break;
                case 6:
                    if (v.b.userTimeout && input == '!!!') {
                        v.continue = false;
                        api.getUserInfo(message.senderID, function(err, ret) {
                            if (err) return console.error(err);
                            ab.userTimeout.userTimeout(api, message, message.senderID, ret[message.senderID].name);
                        });
                    }
                    break;
                case 7:
                    if (v.b.nickname) ab.nickname.changeNicknameBasic(api, message, input);
                    break;
                case 8:
                    if (v.b.chatColour) ab.chatColour.change(api, message, input);
                    break;
                case 9:
                    if (v.b.endlessTalk) ab.endlessTalk.me(api, message, input);
                    break;
                case 10:
                    ab.basic.respondSwitch(api, message, input);
                    break;
                case 11:
                    if (v.b.quickNotifications) ab.quickNotifications.createNotifyData(api, message, input);
                    break;
                case 12:
                    if (v.b.remind) ab.remind.setTimezone(api, message, input);
                    break;
                case 13:
                    if (v.b.remind) ab.remind.createTimeNotification(api, message, input);
                    break;
                case 14:
                    if (v.b.translate) ab.translate.parse(api, message, input);
                    break;
                case 15:
                    if (v.b.quote) ab.quote.listener(api, message, input);
                    break;
                    //TODO yes no nickname
                default:
                    if (v.b.talkBack) ab.basic.respondRequest(api, message, input);
                    return;
            }
        }
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
