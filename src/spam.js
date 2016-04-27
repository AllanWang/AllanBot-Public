var v = require('./globalVariables');

function listener(api, message, input) {
    if (input != '--spam') return;
    v.continue = false;
    if (v.devMode) {
        spam(api, message);
    } else {
        api.sendMessage('You do not have the power to do this.', message.threadID);
    }
}

function spam(api, message) {
    v.continue = false;
    for (var i = 0; i < 25; i++) {
        setTimeout(function() {
            if (!v.isMuted) {
                var text = '';
                for (var j = 0; j < 5; j++) {
                    text += Array(11).join((Math.random().toString(36) + '00000000000000000').slice(2, 18)).slice(0, 10) + '\n';
                }
                api.sendMessage(text, message.threadID);
            } else {
                clearTimeout();
            }
        }, 500);
    }
}

module.exports = {
    listener: listener,
    spam: spam
}
