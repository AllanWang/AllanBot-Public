var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function create(api, message, input, i) {
    if (!i) i = 1;
    api.getThreadHistory(message.threadID, i, i + 19, Date.now(), function callback(error, history) {
        if (error) return log.error('Error in getting quote', error);
        for (var j = 0; j < history.length; j++) {
            if (history[j].body.slice(0, input.length) == input) {
                api.sendMessage(history[j].body, message.threadID);
                return;
            }
        }
        if (i > 100) return;
        create(api, message, input, i + 20);
    });
}

module.exports = {
    create: create
}
