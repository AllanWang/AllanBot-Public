var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

//remove value from array
function removeA(arr) {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function full(api, max) {
    v.section = 'Full data retrieval';
    log.info('--- Retrieving facebook data for firebase ---')
    api.getThreadList(0, max, function callback(err, arr) {
        if (err) return log.error(err);
        var id = []
        for (var i = 0; i < arr.length; i++) {
            thread(api, arr[i].threadID);
            for (var j = 0; j < arr[i].participantIDs.length; j++) {
                if (v.contains(id, arr[i].participantIDs[j])) continue;
                id.push(arr[i].participantIDs[j]);
            }
        }
        user(api, id);
    });
}

function thread(api, threadID) {
    v.section = 'dataCollection thread';
    api.getThreadInfo(threadID, function callback(error, info) {
        if (error || !info) return log.warn(threadID, 'thread could not be extracted'); //TODO figure out how to remove the errors here
        var name = info.name;
        if (!name || name.trim().length == 0) return buildThreadName(api, threadID, info.participantIDs);
        if (!f.get('threads/' + threadID + '/name')) api.sendMessage('New conversation found: ' + name + '\n' + threadID, v.myID);
        f.setDataSimple('threads/' + threadID + '/name', name, null);
    });
}

function buildThreadName(api, threadID, ids) {
    v.section = 'dataCollection buildThreadName';
    if (ids.length == 2) ids = removeA(ids, v.botID);
    api.getUserInfo(ids, function callback(err, obj) {
        if (err) return log.warn('buildThreadName', 'user could not be extracted');
        var threadName = '-';
        var first = true;;
        Object.keys(obj).forEach(function(user) {
            if (!first) {
                threadName += ',';
            }
            threadName += ' ' + obj[user].name;
            first = false;
        });
        if (!f.get('threads/' + threadID + '/name')) api.sendMessage('New conversation found: ' + threadName + '\n' + threadID, v.myID);
        f.setDataSimple('threads/' + threadID + '/name', threadName, null);
    });
}

function user(api, userID) {
    v.section = 'dataCollection user';
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) return log.warn(userID, 'user could not be extracted');
        for (var user in obj) {
            var fLocation = 'users/' + user + '/'; //as a base, extra child will be added later
            f.setDataSimple(fLocation + 'name', obj[user].name, null);
            f.setDataSimple(fLocation + 'firstName', obj[user].firstName, null);
        }
    });
}

function threadName(api, threadID, callback) {
    v.section = 'dataCollection threadName';
    if (!callback) callback = function() {};
    var name = f.get('threads/' + threadID + '/name');
    if (name) return callback(name);
    api.getThreadInfo(threadID, function callback(error, info) {
        if (error) {
            log.warn(threadID, 'thread could not be extracted'); //TODO figure out how to remove the errors here
            log.error(error);
            callback('error');
            return;
        }
        name = info.name;
        if (!name || name.trim().length == 0) return buildThreadNameCallback(api, threadID, info.participantIDs, callback);
        f.setDataSimple('threads/' + threadID + '/name', name, null);
        callback(name);
        //return name here via callback
    });
}

function buildThreadNameCallback(api, threadID, ids, callback) {
    v.section = 'dataCollection buildThreadNameCallback';
    if (ids.length == 2) ids = removeA(ids, v.botID);
    api.getUserInfo(ids, function callback(err, obj) {
        if (err) return log.warn('buildThreadName', 'user could not be extracted');
        var threadName = '-';
        var first = true;;
        Object.keys(obj).forEach(function(user) {
            if (!first) {
                threadName += ',';
            }
            threadName += ' ' + obj[user].name;
            first = false;
        });
        f.setDataSimple('threads/' + threadID + '/name', threadName, null);
        return callback(threadName);
    });
}

function request(fromLang, toLang, phrase, callback) {
    v.section = 'translate request';
    invalid = '';
    fromLang = getLanKey(fromLang);
    toLang = getLanKey(toLang);
    if (invalid) {
        callback(null, invalid + ' is not a valid language/key');
        return;
    }
    // log.info('Translating', phrase, 'from', fromLang, 'to', toLang);
    translate(fromLang, toLang, phrase)
        .then(function(result) {
            callback(null, result);
        })
        .catch(function(err) {
            log.error('Translate error', err);
            return callback(err);
        })
}

function firstName(api, userID, callback) {
    v.section = 'dataCollection firstName';
    if (!callback) callback = function() {};
    var name = f.get('users/' + userID + '/firstName');
    if (name) return callback(name);
    log.info('Retrieving first name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) {
            log.error(err);
            return callback('error');
        }
        f.setDataSimple('users/' + userID + '/firstName', obj[userID].firstName, null);
        callback(obj[userID].firstName);
    });
}

function fullName(api, userID, callback) {
    if (!callback) callback = function() {};
    v.section = 'dataCollection fullName';
    var name = f.get('users/' + userID + '/name');
    if (name) return callback(name);
    log.info('Retrieving full name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) {
            log.error(err);
            return callback('error');
        }
        f.setDataSimple('users/' + userID + '/name', obj[userID].name, null);
        callback(obj[userID].name);
    });
}

function collect(api, message, input) {
    v.section = 'dataCollection collect';
    if (message.senderID != v.myID) return;
    if (input.slice(0, 2) == '% ') {
        v.continue = false;
        thread(api, input.slice(2));
    }
    if (input != '--collect') return;
    v.continue = false;
    api.sendMessage('Collecting thread and user data...', message.threadID);
    full(api, 100);
}

module.exports = {
    collect: collect,
    full: full,
    thread: thread,
    threadName: threadName,
    firstName: firstName,
    fullName: fullName
}
