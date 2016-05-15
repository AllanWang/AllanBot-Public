var v = require('./globalVariables');

function listener(api, message, input) {
    v.section = 'chatTitle listener';
    if (input.slice(0, 7) != 'title: ') return;
    set(api, message, input.slice(7));
}

function set(api, message, input) {
    v.section = 'chatTitle set';
    v.continue = false;
    var i = 250; //max number of characters allowed
    if (input.length > i) {
        api.sendMessage('Input too long; cutting off to ' + i + ' characters.', message.threadID);
        input = input.slice(0, i);
    }
    api.setTitle(input, message.threadID, function callback(err) {
        if (err) return console.error(err);
    });
}

module.exports = {
    listener: listener,
    set: set
}
