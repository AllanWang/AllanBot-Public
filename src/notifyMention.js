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
                if (firstName == 'error') return api.sendMessage('Error', message.threadID);
                addKey(api, message, firstName);
            });
        } else {
            switch (key) {
                case '--clear':
                    f.setData(api, message, 'notifyMention/' + message.senderID + '/keys', null, 'Keys cleared');
                    break;
                case '--keys':
                    var currentKeys = f.get('notifyMention/' + message.senderID + '/keys');
                    var ignoreKeys = f.get('notifyMention/' + message.senderID + '/ignore');
                    var text = '';
                    if (currentKeys) {
                        text += 'Keys: ' + currentKeys.replace(/\|/g, ", ");
                    }
                    if (ignoreKeys) {
                        text += 'Ignored keys: ' + ignoreKeys.replace(/\|/g, ", ");
                    }
                    if (text.length == 0) {
                        text = 'No keys found';
                    }
                    api.sendMessage(text, message.threadID);
                    break;
                default:
                    addKey(api, message, key);
                    break;
            }
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
            var keyObj = notifList[id].keys;
            if (!keyObj) return;
            var keyList = keyObj.split('|');
            var ignoreObj = f.get('notifyMention/' + id + '/ignore');
            if (ignoreObj) {
                var ignoreList = ignoreObj.split('|');
                for (var j = 0; j < ignoreList.length; j++) {
                    if (v.contains(input, ignoreList[j])) return;
                }
            }
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
        addAntiKey(api, message, key.slice(1));
        return;
    }
    var prevKey = f.get('notifyMention/' + message.senderID + '/keys');
    if (prevKey) {
        var prevKeyArr = prevKey.split('|');
        for (var i = 0; i < prevKeyArr.length; i++) {
            if (v.contains(key, prevKeyArr[i])) {
                api.sendMessage(key + ' is already incorporated within the other keys:\n' + prevKey.replace(/\|/g, ", ") + '\nThere is no need to add it.', message.threadID);
                return;
            }
        }
        key = prevKey + '|' + key;
    } else {
        key = key.toLowerCase();
        api.sendMessage('I will notify you here; this message is just to verify that I can message you properly.', message.senderID);
    }
    f.setData(api, message, 'notifyMention/' + message.senderID + '/keys', key, 'Saved. You will now be notified when someone uses: "' + key.replace(/\|/g, ", ") + '"');
}

function addAntiKey(api, message, key) {
    v.section = 'notifyMention addAntiKey';
    key = key.trim();
    if (key.length == 0) return;
    if (v.contains(key, '|')) {
        api.sendMessage('Key cannot contain |, please try again', message.threadID);
        return;
    }
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
