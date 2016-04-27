var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var basic = require('./basic');

function me(api, message) {
    v.continue = false;
    api.getUserInfo(message.senderID, function(err, ret) {
        if (err) return console.error(err);
        var name = ret[message.senderID].firstName;
        f.setData(api, message, v.f.Endless.child(message.threadID).child(message.senderID), name, '@' + name + ' how are you?');
    });
}

function listener(api, message, input) {
    if (input == '--me') {
        me(api, message);
    } else if (v.godMode && input.slice(0, v.botNameLength + 2) == ('@' + v.botNameL + '2')) {
        set(api, message, input.slice(v.botNameLength + 2));
    }
}

function set(api, message, name) {
    v.continue = false;
    name = name.trim();
    var nameOrig = name;
    name = name.toLowerCase();
    api.getThreadInfo(message.threadID, function callback(err, info) {
        if (err) return console.error(err);
        if (name == v.botNameL) {
            api.sendMessage("I don't want to talk to myself.", message.threadID);
        } else {
            api.getUserInfo(info.participantIDs, function(err, ret) {
                if (err) return console.error(err);
                for (var id in ret) {
                    if (ret.hasOwnProperty(id)) {
                        var participantName = ret[id].name.toLowerCase();
                        if (v.contains(participantName, name) && id != v.botID) {
                            if (v.isBotName(ret[id].firstName)) continue;
                            console.log("correct endlessTalk id is " + id);
                            f.setData(api, message, v.f.Endless.child(message.threadID).child(id), nameOrig, '@' + nameOrig + ' how are you?');
                        }
                    }
                }
            });
        }
    });
}

function inAction(api, message) {
    try {
        if (v.sBase.boolean.endless_talk[message.threadID][message.senderID]) {
            v.continue = false;
            var name = v.sBase.boolean.endless_talk[message.threadID][message.senderID];
            if (v.contains(message.body, 'stop') && !v.contains(message.body, "don't") && !v.contains(message.body, 'not')) {
                f.setData(api, message, v.f.Endless.child(message.threadID).child(message.senderID), null, "Okay " + name + ", I'll stop.");
            } else {
                basic.respondRequest(api, message, message.body, '@' + name + ' ');
            }
        }
    } catch (err) {
        //Do nothing, endlessTalk is not enabled
    }
}


module.exports = {
    me: me,
    listener: listener,
    inAction: inAction
}
