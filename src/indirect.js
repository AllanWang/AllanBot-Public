var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var d = require('./dataCollection');

function messageInWaiting(api, message) {
    v.section = 'indirect messageInWaiting';
    var msg = f.get('threads/' + message.threadID + '/messages_in_waiting');
    if (msg) {
        api.sendMessage(msg, message.threadID);
        f.setDataSimple2('threads/' + message.threadID + '/messages_in_waiting', null, null);
    }
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
}

function saveConversationList(api, message) {
    v.section = 'indirect saveConversationList';
    if (!f.get('threads/' + message.threadID + '/name')) d.thread(api, message.threadID);
}

module.exports = {
    messageInWaiting: messageInWaiting,
    distantMessages: distantMessages,
    printConvoMap: printConvoMap,
    saveConversationList: saveConversationList
}
