var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var moment = require('moment-timezone');
var count = 0;

function listener(api, message, input) {
    if (input.slice(0, 11) == '--find all ') {
        api.getThreadInfo(message.threadID, function callback(error, info) {
            if (error) return log.error('Count error', error);
            create(api, message, input.slice(11), info.messageCount);
        });
        return;
    }
    if (input.slice(0, 7) == '--find ') return create(api, message, input.slice(7), 1000);
    if (input.slice(0, 8) == '--quote ') return create(api, message, input.slice(8), 1000, true);
    if (input == '--quotes') return print(api, message);
    if (input == '--all quotes') return print(api, message, true);
    if (input == '--count') return countFunction(api, message);
}

function countFunction(api, message) {
    v.continue = false;
    api.getThreadInfo(message.threadID, function callback(error, info) {
        if (error) return log.error('Count error', error);
        api.sendMessage('There are ' + info.messageCount + ' messages', message.threadID);
    });
}

function print(api, message, all) {
    v.continue = false;
    try {
        if (v.sBase.quotes[message.threadID]) {
            var s = 'Quotes:';
            for (var c in v.sBase.quotes[message.threadID]) {
                if (!all) {
                    if (c.split('_')[1] != message.senderID) continue;
                }
                s += '\n\n' + v.sBase.quotes[message.threadID][c];
            }
            api.sendMessage(s, message.threadID);
        } else {
            api.sendMessage('No quotes found', message.threadID);
        }
    } catch (err) {
        api.sendMessage('No quotes found', message.threadID);
    }
}

function create(api, message, input, i, save) {
    input = input.trim().toLowerCase();
    v.continue = false;
    if (input.length == 0) return;
    count = 0;
    log.info('finding', input, '...');
    setTimeout(function() {
        if (count == 0) {
            api.sendMessage('Still looking for ' + input + '...', message.threadID);
        }
    }, 3000);
    // if (!i) i = 1;
    // log.info('i', i);
    api.getThreadHistory(message.threadID, 1, i, null, function callback(error, history) {
        if (error) return log.error('Error in getting quote', error);
        // log.info('i', i);
        // log.info('h', history[history.length - 2], history.length);
        // for (var j = history.length - 1; j >= 0; j--) {
        //     if (!history[j].body) continue;
        //     if (history[j].body.slice(0, input.length).toLowerCase() == input) {
        //         if (history[j].body.toLowerCase().slice(0, v.botNameLength + 1) == '@' + v.botNameL) continue;
        //         if (history[j].senderID.split(':')[1] == v.botID) continue;
        //         output(api, message, history[j], save);
        //         // return;
        //     }
        // }
        for (var j = history.length - 2; j >= 0; j--) { //do not include last message
            if (!history[j].body) continue;
            if (v.contains(history[j].body, input)) {
                if (history[j].body.toLowerCase().slice(0, 1) == '@') {
                    if (v.contains(history[j].body, v.botNameL)) continue;
                    if (v.contains(history[j].body, '--')) continue;
                }
                if (v.contains(v.ignoreArray, history[j].senderID.split(':')[1])) continue;
                // if (history[j].senderID.split(':')[1] == v.botID) continue;
                output(api, message, history[j], save);
                if (save) return;
                count++;
                if (count >= 5) return;
                // return;
            }
        }
        // if (i > 100) return;
        // create(api, message, input, save, i * 2);

        if (count == 0) {
            count = -1;
            api.sendMessage('Could not find text that contains ' + v.quotes(input) + ' within the last ' + history.length + ' messages.', message.threadID);
        }
        // if (i > 500) return;
        // create(api, message, input, i + 20);
    });
}

function output(api, message, text, save) {
    var tag = '-' + text.senderName + ' ' + moment(text.timestamp).format('MM/DD/YYYY');
    var s = text.body;
    if (!v.contains(text.body, tag)) s += '\n' + tag;
    api.sendMessage(s, message.threadID);
    if (save) f.setDataSimple(v.f.Quote.child(message.threadID).child(Date.now() + '_' + message.senderID), s, null);
}

module.exports = {
    create: create,
    listener: listener,
    print: print
}
