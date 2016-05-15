var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function listener(api, message, input) {
    v.section = 'quickNotifications listener';
    if (input.toLowerCase() == '--eqn') {
        v.continue = false;
        f.setData(api, message, 'users/' + message.senderID + '/QN', true, 'Quick notifications enabled.\nYou only need to do this once until you disable it.');
    } else if (input.toLowerCase() == '--dqn') {
        v.continue = false;
        f.setData(api, message, 'users/' + message.senderID + '/QN', null, 'Quick notifications disabled.');
    } else if ((!v.isMuted || v.godMode) && message.threadID != v.myID) {
        if (input.slice(0, 1) == '@' && input.length > 5 && input.indexOf(":") > 1) {
            v.continue = false;
            if (f.get('users/' + message.senderID + '/QN')) {
                addnotifyData(api, message, input);
            } else if (!v.contains(v.ignoreArray, message.senderID)) {
                api.sendMessage('To enable quick notifications, type "@' + v.botNameL + ' --eqn"', message.threadID);
            }
        }
    }
}

function notifyData(api, message) {
    v.section = 'quickNotifications notifyData';
    var msg = f.get('threads/' + message.threadID + '/quickNotifications/' + message.senderID);
    if (msg) {
        api.sendMessage(msg, message.threadID);
        f.setDataSimple('threads/' + message.threadID + '/quickNotifications/' + message.senderID, null, null);
    }
}

function addnotifyData(api, message, input) {
    v.section = 'quickNotifications addnotifyData';
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

                //checks for exact matches

                for (var id in ret) {
                    if (ret.hasOwnProperty(id)) {
                        var participantName = ret[id].firstName.toLowerCase();
                        if (participantName == name) {
                            // Match. Do matched stuff.
                            count++;
                            if (id == message.senderID) {
                                count--; //ignore count for self
                            } else if (id == v.botID) {
                                log.info('ignore id for own bot');
                            } else {
                                log.info("correct id is " + id);
                                var prev = f.get('threads/' + message.threadID + '/quickNotifications/' + id);
                                if (prev) {
                                    text = prev + '\n' + fullText;
                                } else {
                                    text = intro + fullText;
                                }
                                f.setData(api, message, 'threads/' + message.threadID + '/quickNotifications/' + id, text, 'Notification saved for ' + ret[id].name + ':\n' + fullText);
                            }
                        }
                    }
                }
                if (count > 0) return;

                //second run checking if input is contained in name

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
                                var prev = f.get('threads/' + message.threadID + '/quickNotifications/' + id);
                                if (prev) {
                                    text = prev + '\n' + fullText;
                                } else {
                                    text = intro + fullText;
                                }
                                f.setData(api, message, 'threads/' + message.threadID + '/quickNotifications/' + id, text, 'Notification saved for ' + ret[id].name + ':\n' + fullText);
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
