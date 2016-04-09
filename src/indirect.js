var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function messageInWaiting(api, message) {
    try {
        if (v.sBase.messages_in_waiting[message.threadID]) {
            api.sendMessage(v.sBase.messages_in_waiting[message.threadID], message.threadID);
            f.setData(api, message, v.f.MIW.child(message.threadID), null, null);
        }
    } catch (err) {
        //carry on; no messages
    }
}

function distantMessages(api, message) {
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
            f.setData(api, message, v.f.MIW.child(threadID), content, "To be sent to " + threadID + ':\n' + content);
            return;
        }

        api.sendMessage('Sent', v.myID);
    });
}

function printConvoMap(api) {
    v.continue = false;
    try {
        if (v.sBase.conversations) {
            var s = 'Convo map\n';
            for (var c in v.sBase.conversations) {
                s += '\n' + c + ': ' + v.sBase.conversations[c];
            }
            api.sendMessage(s, v.myID);
        } else {
            api.sendMessage('No thread list found under ' + child, v.myID);
        }
    } catch (err) {
        api.sendMessage('No thread list found under ' + child, v.myID);
        return console.log(err);
    }
}

function saveConversationList(api, message) {
    api.getThreadInfo(message.threadID, function callback(err, info) {
        if (err) return console.error(err);
        try {
            if (!v.sBase.conversations[message.threadID]) {
                //thread not saved
                f.setData(api, message, v.f.Conversations.child(message.threadID), info.name, null);
                api.sendMessage('New conversation found: ' + info.name + '\n' + message.threadID, v.myID);
            } else if (info.name != v.sBase.conversations[message.threadID]) {
                f.setData(api, message, v.f.Conversations.child(message.threadID), info.name, null);
            }
        } catch (err) {
            //thread not saved
            f.setData(api, message, v.f.Conversations.child(message.threadID), info.name, null);
            api.sendMessage('New conversation found: ' + info.name + '\n' + message.threadID, v.myID);
        }
    });
}

module.exports = {
    messageInWaiting: messageInWaiting,
    distantMessages: distantMessages,
    printConvoMap: printConvoMap,
    saveConversationList: saveConversationList
}