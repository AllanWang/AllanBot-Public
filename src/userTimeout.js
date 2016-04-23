var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function afterRestart(api) {
    try {
        if (v.sBase.boolean.timeout) {
            for (var t in v.sBase.boolean.timeout) {
                var i = t.toString().indexOf('_');
                if (i == -1) {
                    api.sendMessage('"_" not found in the timeout key; first run stopping', v.myID);
                    return;
                }
                var thread = t.toString().slice(0, i);
                var id = t.toString().slice(i + 1);
                api.sendMessage('I was restarted; adding back ' + v.sBase.boolean.timeout[t] + '.', thread);
                userUnTimeout(api, id, v.sBase.boolean.timeout[t], thread);
            }
        }

    } catch (err) {
        //no one is still banned; carry no
    }
}

function userTimeout(api, message, id, name) {
    if (!v.firebaseOn) {
        log.error('firebase is not enabled, see initializeFirebase');
        return;
    }
    v.continue = false;
    if (id == v.botID) {
        api.sendMessage("Sorry, I don't want to ban myself.", message.threadID);
        return;
    }
    f.setData(api, message, v.f.Timeout.child(message.threadID + '_' + id), name, name + ", you have been banned for 5 minutes.");
    try {
        api.sendMessage('You have been banned from ' + message.threadName + ' for 5 minutes', id);
    } catch (err) {
        api.sendMessage("I couldn't notify " + name + " about being banned from " + message.threadName, allanID);
    }
    setTimeout(function() {
        api.removeUserFromGroup(id, message.threadID, function callback(err) {
            if (err) return console.error(err);
        });
    }, 2000);

    setTimeout(function() {
        userUnTimeout(api, id, name, message.threadID);
    }, 300000);
}

function userUnTimeout(api, id, name, thread) {
    v.continue = false;
    api.addUserToGroup(id, thread, function callback(err) {
        if (err) { //TODO see if this is fixed; api issue
            // api.sendMessage("uh... I can't add " + name + " back", message.threadID);
            api.sendMessage('Welcome back ' + name + '; try not to get banned again.', thread);
            f.setDataSimple(v.f.Timeout.child(thread + '_' + id), null, null);
            return console.error(err);
            //facebook error
        }

        api.sendMessage('Welcome back ' + name + '; try not to get banned again.', thread);
        f.setDataSimple(v.f.Timeout.child(thread + '_' + id), null, null);
    });
}

module.exports = {
    afterRestart: afterRestart,
    userTimeout: userTimeout,
    userUnTimeout: userUnTimeout
}