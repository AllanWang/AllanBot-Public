var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var d = require('./dataCollection');

function listener(api, message, input) {
    v.section = 'notifyMention listener';
    if (input.slice(0, 1) == '@') {
        if ((input.toLowerCase().slice(0, v.botNameLength + 2) == '@' + v.botNameL + ' ') && input.length > (v.botNameLength + 2)) {
            input = input.slice(v.botNameLength + 2);
            if (input.slice(0, 8) == '--notify') {

            } else if (input.slice(0, 9) == '--context') {
                if (!f.get('notifyMention/' + message.senderID)) {
                    api.sendMessage('Mention notifications are not enabled for you; to enable it, type "@' + v.botNameL + ' --notify"', message.threadID);
                }
                if (input.trim().length == 9) {

                }
            }
        } else {
            if (v.contains(v.ignoreArray, message.senderID)) return;
            var notifList = f.get('notifyMention');
            if (!notifList) return;
            for (var id in notifList) {
                if (input.slice(1, notifList[id].length + 2).toLowerCase() == (notifList[id] + ' ')) {
                    if (message.senderID == id) continue;
                    api.sendMessage('From ' + fullName(api, message.senderID) + ' in ' + threadName(api, message.threadID) + ':\n' + input, id);
                    return;
                }
            }
        }
    } else {
        if (v.contains(v.ignoreArray, message.senderID)) return;
        var notifList = f.get('notifyMention');
        if (!notifList) return;
        for (var id in notifList) {
            if (v.contains(input, notifList[id])) {
                if (message.senderID == id) continue;
                api.sendMessage('From ' + fullName(api, message.senderID) + ' in ' + threadName(api, message.threadID) + ':\n' + input, id);
                return;
            }
        }
    }
}

function context(api, threadID) {
    v.section = 'indirect context';
    v.continue = false;
    var searching = true;
    setTimeout(function() {
        if (searching) api.sendMessage('Still searching for context...', threadID);
    }, 5000);
    api.getThreadHistory(threadID, 1, 1000, null, function callback(error, history) {
        if (error) return log.error('Error in getting quote', error);
        for (var j = history.length - 2; j >= 0; j--) { //do not include last message
            if (!history[j].body) continue;
            if (!searching) break;
            if (v.contains(history[j].body, v.myName) && !v.contains(history[j].body, v.botName) && !v.contains(history[j].body, "@" + v.myName) && !v.contains(history[j].senderID, v.botID)) {
                searching = false;
                var result = 'Context for ' + v.myName + ' in ' + f.get('threads/' + threadID + '/name');
                var lastID = 0;
                var contextRange = 5;
                for (var k = j - contextRange; k <= j + contextRange; k++) {
                    if (k < 0) continue;
                    if (k > history.length - 1) continue;
                    if (!history[k].body) continue;
                    result += '\n';
                    if (lastID != history[k].senderID) {
                        result += '\n' + history[k].senderName + ': ';
                        lastID = history[k].senderID;
                    }
                    result += history[k].body;
                }
                api.sendMessage(result, threadID);
            }

        }


        if (searching) {
            searching = false;
            api.sendMessage('Could not find ' + v.myName + ' within the last ' + history.length + ' messages.', threadID);
        }

    });
}

module.exports = {
    listener: listener,
    context: context
}
