var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function listen(api, message, input) {
    if (!v.contains(input, '@' + v.botNameL)) return;
    if (v.contains(input, '--online')) {
        v.continue = false;
        f.setData(api, message, v.f.Offline, null, v.botName + ' is now enabled');
        if (message.senderID != v.myID) {
            api.getUserInfo(message.senderID, function(err, ret) {
                if (err) return console.error(err);
                api.sendMessage('--online used by ' + ret[message.senderID].name, v.myID);
            });
        }
    } else if (v.contains(input, '--offline')) {
        v.continue = false;
        f.setData(api, message, v.f.Offline, true, v.botName + ' is now disabled');
        setTimeout(function() {
            f.setData(api, message, v.f.Offline, null, v.botName + ' is now enabled again');
        }, 3600000);
    }
}

function check(api, message) {
    try {
        if (v.sBase.boolean.heroku_offline) {
            v.continue = false;
        }
    } catch (err) {
        //do nothing
    }
}

module.exports = {
    listen: listen,
    check: check
}