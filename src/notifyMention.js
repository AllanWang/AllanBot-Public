var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var d = require('./dataCollection');

function listener(api, message, input) {
    v.section = 'notifyMention listener';
    if (input.slice(0, 8) == '--notify') {
        v.continue = false;
        var key = input.slice(8).trim();
        if (!key || key.length == 0) {
            d.firstName(api, message.senderID, function callback(firstName) {
                if (firstName == 'error') return;
                addKey(api, message, firstName);
            })
        }

        switch (key) {
            case '--clear':
                f.setData(api, message, 'notifyMention/' + message.senderID, null, 'Keys cleared');
                break;
            case '--keys':
                var currentKeys = f.get('notifyMention/' + message.senderID);
                if (currentKeys) {
                    api.sendMessage('Keys: ' + currentKeys.replace(/\|/g, ", "), message.threadID);
                } else {
                    api.sendMessage('No keys added', message.threadID);
                }
                break;
            default:
                addKey(api, message, key);
                break;
        }
    }
}

function inputListener(api, message, input) {
    v.section = 'notifyMention inputListener';
    if (v.contains(v.ignoreArray, message.senderID)) return;
    var notifList = f.get('notifyMention');
    if (!notifList) return;
    api.getThreadInfo(message.threadID, function callback(error, info) {
        var threadIDs;
        if (!error) {
            threadIDs = info.participantIDs;
        } else {
            log.warn('participants not found for', message.threadID);
        }
        for (var id in notifList) {
            if (message.senderID == id) continue;
            if (id != v.myID && !v.contains(threadIDs, id)) continue;
            var keyList = notifList[id].split('|');
            for (var i = 0; i < keyList.length; i++) {
                if (v.contains(input, keyList[i])) {
                    notifyUser(api, message, input, id);
                    return;
                }
            }
        }
    });
}

function addKey(api, message, key) {
    v.section = 'notifyMention addKey';
    if (v.contains(key, '|')) {
        api.sendMessage('Key cannot contain |, please try again', message.threadID);
        return;
    }
    if (key.slice(0, 1) == '!') {
        addAntiKey(api, message, key.slice(0, 1));
        return;
    }
    var prevKey = f.get('notifyMention/' + message.senderID);
    if (prevKey) {
        var prevKeyArr = prevKey.split('|');
        for (var i = 0; i < prevKeyArr.length; i++) {
            if (v.contains(key, prevKeyArr[i])) {
                api.sendMessage(key + ' is already incorporated within the other keys:\n' + prevKey.replace(/\|/g, ", "), message.threadID);
                return;
            }
        }
        key = prevKey + '|' + key;
    } else {
        key = key.toLowerCase();
        api.sendMessage('I will notify you here; this message is just to verify that I can message you properly.', message.senderID);
    }
    f.setData(api, message, 'notifyMention/' + message.senderID, key, 'Saved. You will now be notified when someone uses: "' + key.replace(/\|/g, ", ") + '"');
}

function addAntiKey(api, message, key) {
    v.section = 'notifyMention addAntiKey';
    var prevKey = f.get('notifyMention/' + message.senderID + '/ignore');
    if (prevKey) {
        var prevKeyArr = prevKey.split('|');
        for (var i = 0; i < prevKeyArr.length; i++) {
            if (v.contains(key, prevKeyArr[i])) {
                api.sendMessage(key + ' is already incorporated within the other ignored keys:\n' + prevKey.replace(/\|/g, ", "), message.threadID);
                return;
            }
        }
        key = prevKey + '|' + key;
    } else {
        key = key.toLowerCase();
    }
    f.setData(api, message, 'notifyMention/' + message.senderID + '/ignore', key, 'Saved. You will no longer be notified when someone uses: "' + key.replace(/\|/g, ", ") + '"');
}

function notifyUser(api, message, input, id) {
    v.section = 'notifyMention notifyUser';
    d.fullName(api, message.senderID, function callback(fullName) {
        d.threadName(api, message.threadID, function callback(threadName) {
            api.sendMessage('From ' + fullName + ' in ' + threadName + ':\n' + input, id);
            return;
        });
    });
}

module.exports = {
    listener: listener,
    inputListener: inputListener
}
