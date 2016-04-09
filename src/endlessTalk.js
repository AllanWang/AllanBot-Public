var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var basic = require('./basic');

function endlessTalkMe(api, message, input) {
    if (input != '--me') {
        return;
    }
    api.getUserInfo(message.senderID, function(err, ret) {
        if (err) return console.error(err);
        var name = ret[message.senderID].firstName;
        f.setData(api, message, v.f.Endless.child(message.threadID).child(message.senderID), name, '@' + name + ' how are you?');
    });
}

function endlessTalk(api, message, name) {
    if (message.body.slice(0, v.botNameLength + 2) != ('@' + v.botNameL + '2')) return false;
    if (!v.b.endlessTalk) {
        log.info('endlessTalk is not enabled');
        return false;
    }
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
                        if (participantName.indexOf(name) != -1 && !v.contains(v.ignoreArray, id)) {
                            console.log("correct endlessTalk id is " + id);
                            f.setData(api, message, v.f.Endless.child(message.threadID).child(id), nameOrig, '@' + nameOrig + ' how are you?');
                        }
                    }
                }
            });
        }
    });
    return true;
}

function endlessTalkInAction(api, message) {
    if (!v.b.endlessTalk) return false;
    try {
        if (v.sBase.boolean.endless_talk[message.threadID][message.senderID]) {
            var name = v.sBase.boolean.endless_talk[message.threadID][message.senderID];
            if (message.body.toLowerCase() == 'stop') {
                f.setData(api, message, v.f.Endless.child(message.threadID).child(message.senderID), null, "Okay " + name + ", I'll stop.");
            } else {
                basic.respondRequest(api, message, message.body, '@' + name + ' ');
            }
            return true;
        }
    } catch (err) {
        //Do nothing, endlessTalk is not enabled
    }
    return false;
}


module.exports = {
    endlessTalkMe: endlessTalkMe,
    endlessTalk: endlessTalk,
    endlessTalkInAction: endlessTalkInAction
}