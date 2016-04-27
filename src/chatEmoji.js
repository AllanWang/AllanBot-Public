var v = require('./globalVariables');

function listener(api, message, input) {
    if (input.toLowerCase().slice(0, 6) == 'emoji ' && input.length == 8) {
        change(api, message, message.body.slice(6));
    }
}

function change(api, message, emoji) {
    v.continue = false;
    api.changeThreadEmoji(emoji, message.threadID, function callback(err) {
        if (err) return console.error(err);
    });
}

module.exports = {
    listener: listener,
    change: change
}
