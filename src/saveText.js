var moment = require('moment-timezone');
var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function listener(api, message, input) {
    v.section = 'saveText listener';
    if (input.slice(0, 7) == '--save ' && input.length > 7) {
        v.continue = false;
        log.info('--- Save text ---');
        save(api, message, input.slice(7));
    } else if (input == '--saved') {
        v.continue = false;
        get(api, message);
    } else if (input == '--erase') {
        v.continue = false;
        f.setData2(api, message, 'threads/' + message.threadID + '/savedText/' + message.senderID, null, 'Erased saved text');
    }
}

function save(api, message, input) {
    v.section = 'saveText save';
    v.continue = false;
    input = moment.utc().format('MM/DD/YYYY') + ": " + input;
    var prev = f.get('threads/' + message.threadID + '/savedText/' + message.senderID);
    if (prev) input = prev + '\n' + input;
    f.setData2(api, message, 'threads/' + message.threadID + '/savedText/' + message.senderID, input, 'Saved text:\n\n' + input);
}

function get(api, message) {
    v.section = 'saveText get';
    v.continue = false;
    var text = f.get('threads/' + message.threadID + '/savedText/' + message.senderID);
    if (text) {
        api.sendMessage('Saved text:\n\n' + text, message.threadID);
    } else {
        api.sendMessage('No saved text found.', message.threadID);
    }
}

module.exports = {
    listener: listener,
    save: save,
    get: get
}
