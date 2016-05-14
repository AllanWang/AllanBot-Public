var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

function full(api) {
    log.info('--- Retrieving facebook data for firebase ---')
    api.getThreadList(0, 30, function callback(err, arr) {
        if (err) {
            // log.info('b', v.myID);
            return v.error(api, 'Full data collection', err);
        }

        v.error(api, 'Full data collection', err);
        var id = []
        for (var i = 0; i < arr.length; i++) {
            // thread(api, arr[i].threadID);
            // if (i == 1) log.warn(i, arr[i]);
            for (var j = 0; j < arr[i].participantIDs.length; j++) {
                if (v.contains(id, arr[i].participantIDs[j])) continue;
                id.push(arr[i].participantIDs[j]);
            }
        }
        // log.warn('id list', id);
    });
}

function thread(api, threadID) {
    api.getThreadInfo(threadID, function callback(error, info) {

    });
}

module.exports = {
    full: full
}
