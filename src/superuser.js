var log = require("npmlog");
var v = require('./globalVariables');
var u = require('./userTimeout');

function commands(api, message) {
    if (message.body.slice(0, 1) != '$') return;
    if (message.senderID != v.botID) return;
    log.info('super user command enabled');
    v.continue = false;
    var command = message.body.slice(1);
    if (command.slice(0, 4) == 'ban ') {
        var nameOrig = command.slice(4);
        var name = nameOrig.toLowerCase();
        api.getThreadInfo(message.threadID, function callback(err, info) {
            if (err) return console.error(err);
            api.getUserInfo(info.participantIDs, function(err, ret) {
                if (err) return console.error(err);
                for (var id in ret) {
                    if (ret.hasOwnProperty(id)) {
                        var participantName = ret[id].name.toLowerCase();
                        if (contains(participantName, name) && !contains(participantName, v.botNameL)) {
                            u.userTimeout(api, message, id, nameOrig);
                        }
                    }
                }
            });
        });
    } else if (command.slice(0, 3) == 'add') {
        api.addUserToGroup(v.myID, message.threadID, function callback(err) {
            if (err) {
                api.sendMessage("I couldn't add you", v.myID);
                return console.error(err);
                //facebook error
            }
            api.sendMessage('Welcome ' + v.myName, message.threadID);
        });
    }
}

module.exports = {
    commands: commands
}
