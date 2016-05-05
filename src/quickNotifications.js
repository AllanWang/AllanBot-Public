var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function listener(api, message, input) {
    if (input.toLowerCase() == '--eqn') {
        v.continue = false;
        f.setData(api, message, v.f.QN.child(message.senderID), true, 'Quick notifications enabled.\nYou only need to do this once until you disable it.');
    } else if (input.toLowerCase() == '--dqn') {
        v.continue = false;
        f.setData(api, message, v.f.QN.child(message.senderID), null, 'Quick notifications disabled.');
    } else if ((!v.isMuted || v.godMode) && message.threadID != v.myID) {
        if (input.slice(0, 1) == '@' && input.length > 5 && input.indexOf(":") > 1) {
            v.continue = false;
            try {
                if (v.sBase.boolean.quick_notify[message.senderID]) {
                    addnotifyData(api, message, input);
                } else {
                    api.sendMessage('To enable quick notifications, type "@' + v.botNameL + ' --eqn"', message.threadID);
                }
            } catch (err) {
                api.sendMessage('To enable quick notifications, type "@' + v.botNameL + ' --eqn"', message.threadID);
            }
        }
    }
}

function notifyData(api, message) {
    try {
        if (v.sBase.notificationMessages[message.threadID][message.senderID]) {
            api.sendMessage(v.sBase.notificationMessages[message.threadID][message.senderID], message.threadID);
            f.setData(api, message, v.f.Notifications.child(message.threadID).child(message.senderID), null, null);
        }
    } catch (err) {
        //do nothing, no value exists
    }
}

function addnotifyData(api, message, input) {
    if (input.slice(0, 1) != '@') return;
    var fullText = input.slice(1);
    var i = fullText.indexOf(":");
    if (i < 1) return;
    var nameOrig = fullText.slice(0, i);
    fullText = fullText.slice(i + 1).trim();
    var name = nameOrig.toLowerCase();
    if (name == v.botNameL) return api.sendMessage('You cannot send a notification to ' + botNameL + '.', message.threadID);

    api.getUserInfo(message.senderID, function(err, ret1) {
        if (err) return console.error(err);
        var intro = ret1[message.senderID].firstName + " to " + nameOrig + ": ";
        var text = 'placeholder_text';
        var finalID = 'placeholder_id';
        var count = 0;
        var self = false;

        api.getThreadInfo(message.threadID, function callback(err, info) {
            if (err) return console.error(err);
            api.getUserInfo(info.participantIDs, function(err, ret) {
                if (err) return console.error(err);
                for (var id in ret) {
                    if (ret.hasOwnProperty(id)) {
                        var participantName = ret[id].name.toLowerCase();
                        if (v.contains(participantName, name) && ret[id].firstName.toLowerCase() != v.botNameL) {
                            // Match. Do matched stuff.
                            count++;
                            if (id == message.senderID) {
                                self = true; //for future notification
                            } else if (id == v.botID) {
                                log.info('ignore id for own bot');
                            } else {
                                log.info("correct id is " + id);
                                try {
                                    if (v.sBase.notificationMessages[message.threadID][id]) {
                                        text = v.sBase.notificationMessages[message.threadID][id] + '\n' + fullText;
                                    } else {
                                        text = intro + fullText;
                                    }
                                } catch (err) {
                                    text = intro + fullText;
                                } finally {
                                    f.setData(api, message, v.f.Notifications.child(message.threadID).child(id), text, 'Notification saved for ' + ret[id].name + ':\n' + fullText);
                                }
                            }
                        }
                    }
                }
                if (self && count == 1) {
                    var ss = 'You cannot send notifications to yourself.';
                    api.sendMessage(ss, message.threadID);
                    log.info(ss);
                }
            });
        });
    });
}

module.exports = {
    listener: listener,
    notifyData: notifyData
}
