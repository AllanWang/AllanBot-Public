var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function listener(api, message, input) {
    v.section = 'onOff listener';
    if (!v.contains(input, '@' + v.botNameL)) return;
    if (v.contains(input, '--online')) {
        v.continue = false;
        f.setData2(api, message, 'offline', null, v.botName + ' is now online');
        if (message.senderID != v.myID) {
            api.getUserInfo(message.senderID, function(err, ret) {
                if (err) return console.error(err);
                api.sendMessage('--online used by ' + ret[message.senderID].name, v.myID);
            });
        }
    } else if (v.contains(input, '--offline')) {
        v.continue = false;
        f.setData2(api, message, 'offline', true, v.botName + ' is now offline');
        setTimeout(function() {
            f.setData2(api, message, 'offline', null, v.botName + ' is online again');
        }, 3600000);
    }
}

function check(api, message) {
    v.section = 'onOff check';
    if (!f.get('offline')) return;
    v.continue = false;
    if (message.senderID == v.myID && v.contains(message.body, v.botNameL)) {
        api.sendMessage('I am currently offline', message.threadID);
    }
}

module.exports = {
    listener: listener,
    check: check
}
