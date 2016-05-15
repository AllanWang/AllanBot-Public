var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function full(api, max) {
    v.section = 'Full data retrieval';
    log.info('--- Retrieving facebook data for firebase ---')
    api.getThreadList(0, max, function callback(err, arr) { //20 is arbitrary, increase if necessary
        if (err) return log.error(err);
        var id = []
        for (var i = 0; i < arr.length; i++) {
            // log.info('i', i, arr[i].threadID);
            thread(api, arr[i].threadID);
            for (var j = 0; j < arr[i].participantIDs.length; j++) {
                if (v.contains(id, arr[i].participantIDs[j])) continue;
                id.push(arr[i].participantIDs[j]);
            }
        }
        // for (var k = 0; k < id.length; k++) {
        user(api, id);
        // }
        // log.warn('id list', id);
    });
}

function thread(api, threadID) {
    v.section = 'dataCollection thread';
    api.getThreadInfo(threadID, function callback(error, info) {
        // if (error) return v.error(api, 'Thread data collection', error);
        if (error) return log.warn(threadID, 'thread could not be extracted'); //TODO figure out how to remove the errors here
        // log.info('name', info.name);
        if (!f.get('threads/' + threadID + '/name')) api.sendMessage('New conversation found: ' + info.name + '\n' + threadID, v.myID);
        f.setDataSimple2('threads/' + threadID + '/name', info.name, null);
    });
}

function user(api, userID) {
    v.section = 'dataCollection user';
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) return log.warn(userID, 'user could not be extracted');
        // log.warn(JSON.stringify(obj));
        for (var user in obj) {
            var fLocation = 'users/' + user + '/'; //as a base, extra child will be added later
            f.setDataSimple2(fLocation + 'name', obj[user].name, null);
            f.setDataSimple2(fLocation + 'firstName', obj[user].firstName, null);
        }
    });
}

function firstName(api, userID) {
    v.section = 'dataCollection firstName';
    var name = f.get('users/' + userID + '/firstName');
    if (name) return name;
    log.info('Retrieving first name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) return log.error(err);
        f.setDataSimple2('users/' + userID + '/firstName', obj[user].firstName, null);
        return obj[userID].firstName;
    });
}

function fullName(api, userID) {
    v.section = 'dataCollection fullName';
    var name = f.get('users/' + userID + '/name');
    if (name) return name;
    log.info('Retrieving full name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) return log.error(err);
        f.setDataSimple2('users/' + userID + '/name', obj[user].name, null);
        return obj[userID].name;
    });
}

module.exports = {
    full: full,
    thread: thread,
    firstName: firstName,
    fullName: fullName
}
