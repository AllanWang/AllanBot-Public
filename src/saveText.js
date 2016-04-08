var moment = require('moment-timezone');
var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function saveText(api, message, input) {
    if (!v.firebaseOn) {
        log.error('firebase is not enabled, see initializeFirebase');
        return;
    }
    input = moment.utc().format('MM/DD/YYYY') + ": " + input;
    try {
        input = v.sBase.savedMessages[message.threadID][message.senderID] + "\n" + input;
        f.backup("savedMessages/" + message.threadID + "/" + message.senderID, v.sBase.savedMessages[message.threadID][message.senderID]);
    } catch (err) {
        //Do nothing, no previous input found
    }
    f.setData(api, message, v.f.Saved.child(message.threadID).child(message.senderID), input, 'Saved text:\n' + input);
}

function getSavedText(api, message) {
    if (!v.firebaseOn) {
        log.error('firebase is not enabled, see initializeFirebase');
        return;
    }
    try {
        if (v.sBase.savedMessages[message.threadID][message.senderID]) {
            api.sendMessage('Saved text:\n\n' + v.sBase.savedMessages[message.threadID][message.senderID], message.threadID);
        } else {
            api.sendMessage('No saved text found.', message.threadID);
        }
    } catch (err) {
        api.sendMessage('No saved text found.', message.threadID);
    }
}

module.exports = {
    saveText: saveText,
    getSavedText: getSavedText
}