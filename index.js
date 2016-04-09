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
    'indirect'
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
                var n = options.botName.toString();
                v.botName = n;
                v.botNameLength = n.length;
                v.botNameL = n.toLowerCase();
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
    if (!api) {
        log.warn('API not received; nothing will work.');
    }
    if (!v.botID) {
        log.warn('BotID not set; enabling selfListen in the facebook chat api or using certain advanced functions may produce issues.');
    }
    if (!v.myID) {
        log.warn('ID not set; a few things won\'t work.');
    }
    if (!v.firebaseOn) {
        log.warn('Firebase is not set; a lot of features will not work');
    }
    log.info('--------------------\n     Welcome ' + v.botName + '\n     --------------------');
}

function enableFeatures(options) {
    Object.keys(options).map(function(key) {
        switch (key) {
            case 'spam':
                v.b.spam = options.spam;
                if (bSpam) {
                    log.info('Spam is enabled; this is only for those with devMode');
                }
                break;
            case 'everything':
                for (var b in v.b) {
                    v.b[b] = options.everything;
                }
                break;
            case 'notifyMention':
                if (v.botName && v.botID && v.myID && v.myName) {
                    v.b.notifyMention = options.notifyMention;
                } else {
                    log.warn('notifyMention disabled; make sure you have set both you and the bot\'s name and ID');
                }
                break;
            case 'reminders':
                v.b.reminders = options.reminders;
                if (v.b.reminders) {
                    setTimeout(function() {
                        ab.remind.getScheduledMessages();
                    }, 10000);
                    setInterval(function() {
                        v.nextScheduledMessageNotif = true;
                    }, 500000);
                    setInterval(function() {
                        ab.remind.checkTimeNotification(api);
                    }, 50000);
                }
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

    if (firstRun) { ///first run
        if (v.b.userTimeout) ab.userTimeout.afterRestart(api, message);
        firstRun = false;
    }

    if (message.senderID == v.botID) {
        return; //stop listening to bot
    }

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
                    if (v.b.remind) ab.remind.setTimezone(api, message);
                    break;
                case 1:
                    if (v.b.remind) ab.remind.createTimeNotification(api, message);
                    break;
                case 2:
                    if (v.b.chatColor) ab.chatColour.colorSuggestionListener(api, message);
                    break;
                case 3:
                    if (v.b.quickNotifications) ab.quickNotifications.createNotifyData(api, message);
                    break;
                case 4:
                    if (v.b.endlessTalk) ab.endlessTalk.endlessTalkInAction(api, message);
                    break;
                default:
                    break listeners;
            }
        }

    if (!v.continue) return;

    if (message.threadID == v.myID) {
        if (v.b.indirect) {
            ab.indirect.distantMessages(api, message);
            if (message.body == '--map') ab.indirect.printConvoMap(api); //TODO check
        }
    }
    //input checker
    var input = '';
    if (message.isGroup) {
        if ((message.body.toLowerCase().slice(0, v.botNameLength + 2) == '@' + v.botNameL + ' ') && message.body.length > (v.botNameLength + 2)) {
            input = message.body.slice(v.botNameLength + 2);
        }
    } else {
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
                        if (v.b.endlessTalk) ab.endlessTalk.endlessTalk(api, message);
                        break;
                    default:
                        break masterFeatures;
                }
            }
        if (!v.continue) return;
    }

    //global stuff

    // if (v.godMode) log.info('checking input');
    //Input stuff goes here

    if (input) {
        log.info('Input', input);

        var count3 = -1;
        while (v.continue) {
            count3++;
            // log.info('count2', count2);
            switch (count3) {
                case 0:
                    if (v.godMode) ab.basic.muteToggle(api, message);
                    break;
                case 1:
                    if (v.b.saveText) {
                        if (input.slice(0, 7) == '--save ' && input.length > 7) {
                            ab.saveText.saveText(api, message, input.slice(7));
                            v.continue = false;
                        } else if (input == '--saved') {
                            ab.saveText.getSavedText(api, message);
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
                            f.setData(api, message, v.f.QN.child(message.senderID), true, 'Quick notifications enabled.\nYou only need to do this once until you disable it.');
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
                    if (v.b.help && input == '--help') { //TODO add
                        return v.wip(api, message);
                        help(api, message);
                        v.continue = false;
                    }
                    break;
                case 5:
                    if (v.b.echo && input.slice(0, 7) == '--echo ' && input.length > 7) {
                        var s = input.slice(7);
                        if (!v.godMode) { //TODO add these things
                            if (s.slice(0, 1) == '$') {
                                api.sendMessage('You cannot run commands via echoing', message.threadID);
                                v.continue = false;
                                return;
                            } else if (s.slice(0, v.botNameLength + 1).toLowerCase() == '@' + v.botNameL) {
                                api.sendMessage("I don't want to echo myself.", message.threadID);
                                v.continue = false;
                                return;
                            }
                        }
                        ab.basic.echo(api, message, s);
                        v.continue = false;
                    }
                    break;
                case 6:
                    if (v.b.userTimeout && input == '!!!') {
                        api.getUserInfo(message.senderID, function(err, ret) {
                            if (err) return console.error(err);
                            ab.userTimeout.userTimeout(api, message, message.senderID, ret[message.senderID].name);
                        });
                        v.continue = false;
                    }
                    break;
                case 7:
                    if (v.b.nickname) ab.nickname.changeNicknameBasic(api, message, input);
                    break;
                case 8:
                    if (v.b.chatColour) ab.chatColour.chatColorChange(api, message, input);
                    break;
                case 9:
                    if (v.b.endlessTalk) ab.endlessTalk.endlessTalkMe(api, message, input);
                    break;
                case 10:
                    if (v.pandoraEnabled) {
                        if (input == '--mitsuku') {
                            v.continue = false;
                            v.mitsukuMode = true;
                            api.sendMessage('I will now respond through Mitsuku.', message.threadID);
                        } else if (input == '--pandora') {
                            v.continue = false;
                            v.mitsukuMode = false;
                            api.sendMessage('I will now respond through Pandora.', message.threadID);
                        }
                    }
                    break;
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