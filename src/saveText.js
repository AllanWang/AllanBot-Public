var moment = require('moment-timezone');
var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function listener(api, message, input) {
    if (input.slice(0, 7) == '--save ' && input.length > 7) {
        v.continue = false;
        log.info('--- Save text ---');
        save(api, message, input.slice(7));
    } else if (input == '--saved') {
        v.continue = false;
        get(api, message);
    } else if (input == '--erase') {
        v.continue = false;
        f.setData(api, message, v.f.Saved.child(message.threadID).child(message.senderID), null, 'Erased saved text');
    }
}

function save(api, message, input) {
    v.continue = false;
    input = moment.utc().format('MM/DD/YYYY') + ": " + input;
    try {
        input = v.sBase.savedMessages[message.threadID][message.senderID] + "\n" + input;
        f.backup("savedMessages/" + message.threadID + "/" + message.senderID, v.sBase.savedMessages[message.threadID][message.senderID]);
    } catch (err) {
        //Do nothing, no previous input found
    }
    f.setData(api, message, v.f.Saved.child(message.threadID).child(message.senderID), input, 'Saved text:\n' + input);
}

function get(api, message) {
    v.continue = false;
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
    listener: listener,
    save: save,
    get: get
}
