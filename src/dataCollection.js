var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function full(api) {
    log.info('--- Retrieving facebook data for firebase ---')
    api.getThreadList(0, 20, function callback(err, arr) { //20 is arbitrary, increase if necessary
        if (err) return v.error(api, 'Full data collection', err);
        var id = []
        for (var i = 0; i < arr.length; i++) {
            // log.info('i', i, arr[i].threadID);
            thread(api, arr[i].threadID, i);
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

function thread(api, threadID, i) {
    api.getThreadInfo(threadID, function callback(error, info) {
        // if (error) return v.error(api, 'Thread data collection', error);
        if (error) return log.warn(threadID, 'thread could not be extracted'); //TODO figure out how to remove the errors here
        // log.info('name', info.name);
        f.setDataSimple2('threads/' + threadID + '/name', info.name, null);
    });
}

function user(api, userID) {
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

function getFirstName(api, userID) {
    var name = f.get('users/' + userID + '/firstName');
    if (name) return name;
    log.info('Retrieving first name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) return v.error(api, 'getFirstName', err);
        return obj[userID].firstName;
    });
}

function getName(api, userID) {
    var name = f.get('users/' + userID + '/name');
    if (name) return name;
    log.info('Retrieving first name via api');
    api.getUserInfo(userID, function callback(err, obj) {
        if (err) return v.error(api, 'getName', err);
        return obj[userID].name;
    });
}

module.exports = {
    full: full,
    getFirstName: getFirstName,
    getName: getName
}
