var v = require('./globalVariables');

function listener(api, message, input) {
    if (input.slice(0, 7) == '--echo ' && input.length > 7) {
        var s = input.slice(7);
        if (!v.godMode) { //TODO add these things
            if (s.slice(0, 1) == '$') {
                v.continue = false;
                api.sendMessage('You cannot run commands via echoing', message.threadID); //this is designated for my superuse commands (commands done by the bot) - It is not added
            } else if (s.slice(0, v.botNameLength + 1).toLowerCase() == '@' + v.botNameL) {
                v.continue = false;
                api.sendMessage("I don't want to echo myself.", message.threadID);
            }
        }
        echo(api, message, s);
    }
}

function echo(api, message, input) {
    v.continue = false;
    api.sendMessage(input, message.threadID);
}

module.exports = {
    listener: listener,
    echo: echo
}
