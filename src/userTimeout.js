var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function afterRestart(api) {
    v.section = 'userTimeout afterRestart';
    var timeoutList = f.get('timeout');
    if (timeoutList) {
        for (var t in timeoutList) {
            var thread = t.split('_')[0];
            var id = t.split('_')[1];
            api.sendMessage('I was restarted; adding back ' + timeoutList[t] + '.', thread);
            userUnTimeout(api, id, timeoutList[t], thread);
        }
    }
}

function userTimeout(api, message, id, name) {
    v.section = 'userTimeout userTimeout';
    v.continue = false;
    if (id == v.botID) {
        api.sendMessage("Sorry, I don't want to ban myself.", message.threadID);
        return;
    }
    f.setData2(api, message, 'timeout/' + message.threadID + '_' + id, name, name + ", you have been banned for 5 minutes.");
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
    v.section = 'userTimeout userUnTimeout';
    v.continue = false;
    api.addUserToGroup(id, thread, function callback(err) {
        if (err) console.error(err); //TODO this should have a return, but as there are issues the messages below will show anyways

        api.sendMessage('Welcome back ' + name + '; try not to get banned again.', thread);
        f.setDataSimple('timeout/' + threadID + '_' + id, null, null);
    });
}

module.exports = {
    afterRestart: afterRestart,
    userTimeout: userTimeout,
    userUnTimeout: userUnTimeout
}
