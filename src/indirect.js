var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var d = require('./dataCollection');

function messageInWaiting(api, message) {
    v.section = 'indirect messageInWaiting';
    var msg = f.get('threads/' + message.threadID + '/messages_in_waiting');
    if (msg) {
        api.sendMessage(msg, message.threadID);
        f.setDataSimple('threads/' + message.threadID + '/messages_in_waiting', null, null);
    }
}

function listener(api, message, input) {
    v.section = 'indirect listener';
    var text = input;
    if ((input.toLowerCase().slice(0, v.botNameLength + 2) == '@' + v.botNameL + ' ') && input.length > (v.botNameLength + 2)) {
        text = input.slice(v.botNameLength + 2);
    }
    if (message.threadID == v.myID) {
        if (text.slice(0, 1) == '@') {
            distantMessages(api, message);
        } else if (text == '--map') {
            printConvoMap(api);
        } else if (text.slice(0, 9) == '--context') {
            if (text.slice(9).trim().length == 0) {
                context(api, message.threadID);
            }
        }
    } else if (text.slice(0, 9) == '--context') {
        if (text.slice(9).trim().length == 0) {
            context(api, message.threadID);
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

function distantMessages(api, message) {
    v.section = 'indirect distantMessages';
    if (message.threadID != v.myID) return;
    if (message.body.slice(0, 1) != '@') return;
    var content = message.body.slice(1);
    var i = content.indexOf(": ");
    if (i < 5) {
        api.sendMessage('DistantMessages wrong format', v.myID);
        return;
    }
    v.continue = false;
    var threadID = content.slice(0, i);
    log.info('id', threadID);
    content = content.slice(i + 2);
    api.sendMessage(content, threadID, function callback(err) {
        if (err) {
            //kicked out of group, switch to method 0
            f.setData(api, message, 'threads/' + message.threadID + '/messages_in_waiting', content, "To be sent to " + threadID + ':\n' + content);
            return;
        }

        api.sendMessage('Sent', v.myID);
    });
}

function printConvoMap(api) {
    v.section = 'indirect printConvoMap';
    v.continue = false;
    var map = f.get('threads');
    if (!map) return api.sendMessage('No threads found', v.myID);
    var s = 'Convo map\n';
    for (var c in map) {
        s += '\n' + c + ': ' + map[c].name;
    }
    api.sendMessage(s, v.myID);
}

function saveConversationList(api, message) {
    v.section = 'indirect saveConversationList';
    if (!f.get('threads/' + message.threadID + '/name')) d.thread(api, message.threadID);
}

module.exports = {
    listener: listener,
    messageInWaiting: messageInWaiting,
    distantMessages: distantMessages,
    printConvoMap: printConvoMap,
    saveConversationList: saveConversationList
}
