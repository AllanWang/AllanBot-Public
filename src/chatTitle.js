var v = require('./globalVariables');

function set(api, message, input) {
    if (input.slice(0, 7) != 'title: ') return;
    v.continue = false;
    input = input.slice(7);
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
    set: set
}