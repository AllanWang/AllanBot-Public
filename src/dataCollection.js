var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

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
        if (error) return log.warn(threadID, 'thread could not be extracted'); //TODO figure out how to remove the errors here
        var name = info.name;
        if (!name || name.trim().length == 0) name = 'undefined';
        if (!f.get('threads/' + threadID + '/name')) api.sendMessage('New conversation found: ' + name + '\n' + threadID, v.myID);
        f.setDataSimple('threads/' + threadID + '/name', name, null);
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
    if(!callback) callback = function() {};
    var name = f.get('threads/' + threadID + '/name');
    if (name) return callback(name);
    api.getThreadInfo(threadID, function callback(error, info) {
        if (error) {
        log.warn(threadID, 'thread could not be extracted'); //TODO figure out how to remove the errors here
        callback('error');
      }
        name = info.name;
        if (!name || name.trim().length == 0) name = 'undefined';
        f.setDataSimple('threads/' + threadID + '/name', name, null);
        callback(name);
        //return name here via callback
    });
    // return 'undefined';
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

function firstName(api, userID) {
    v.section = 'dataCollection firstName';
    var name = f.get('users/' + userID + '/firstName');
    if (name) return name;
    log.info('Retrieving first name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) return log.error(err);
        f.setDataSimple('users/' + userID + '/firstName', obj[user].firstName, null);
    });
    return 'undefined';
}

function fullName(api, userID) {
    v.section = 'dataCollection fullName';
    var name = f.get('users/' + userID + '/name');
    if (name) return name;
    log.info('Retrieving full name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) {
            log.error(err);
            return 'error';
        }
        f.setDataSimple('users/' + userID + '/name', obj[user].name, null);
        return obj[userID].name;
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
    firstName: firstName,
    fullName: fullName
}
