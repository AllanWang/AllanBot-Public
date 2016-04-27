var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var moment = require('moment-timezone');

var scheduledMessageTime = 0;
var scheduledMessageKey = 'key';

function listener(api, message, input) {
    if (input.slice(0, 4) == 'UTC ') {
        setTimezone(api, message, input.slice(4));
    } else if (input.slice(0, 7).toLowerCase() == 'remind ') {
        createTimeNotification(api, message, input.slice(7));
    }
}

function setTimezone(api, message, input) {
    v.continue = false;
    var offset = parseInt(input);
    if (isNaN(offset)) {
        api.sendMessage('That is an invalid timezone offset.', message.threadID);
    } else {
        if (Math.abs(offset) < 60) {
            offset *= 60;
        }
        f.setData(api, message, v.f.TimeZone.child(message.senderID), offset, 'Timezone saved! \nYour current time is: ' + moment(Date.now()).utcOffset(offset).format('YYYY-MM-DD HH:mm:ss') + '\n(If this is wrong, you can set it again.)');
    }
}

function createTimeNotification(api, message, content) {
    if (!v.contains(content, '@') || !v.contains(content, ':')) return;
    log.info('creating time notif');
    v.continue = false;
    var offset = 0;
    try {
        if (v.sBase.timezone_offset[message.senderID]) {
            offset = v.sBase.timezone_offset[message.senderID];
        } else {
            api.sendMessage("I don't know what timezone you are in. Please tell me your time offset in the format UTC [offset] and then resend your reminder request.\n(EST is 'UTC -5'; PST is 'UTC -8')", message.threadID);
            return;
        }
    } catch (err) {
        api.sendMessage("I don't know what timezone you are in. Please tell me your time offset in the format UTC [offset] and then resend your reminder request.\n(EST is 'UTC -5'; PST is 'UTC -8')", message.threadID);
        return;
    }
    var anonymous = false;
    var at = content.indexOf('@');

    var name = '';
    name = content.slice(0, at).trim();
    content = content.slice(at + 1);

    if (name == null || name == '') {
        createTimeNotification2(api, message, content, offset, message.threadID, null);
    } else if (name.toLowerCase() == 'me') {
        api.getUserInfo(message.senderID, function(err, ret) {
            if (err) return console.error(err);
            createTimeNotification2(api, message, content, offset, message.threadID, ret[message.senderID].name);
        });
    } else {
        createTimeNotification2(api, message, content, offset, message.threadID, name);
    }
    return;

}

function createTimeNotification2(api, message, content, offset, threadID, name) {
    var colon = content.indexOf(':');
    var j = colon + 5
    if (colon == -1) {
        log.info('no colon');
        return;
    }
    var inputTime = content.slice(0, j).trim(); //everything between @ and 4 chars after :
    if (!v.contains(inputTime, 'am') && !v.contains(inputTime, 'pm')) {
        j -= 2;
        inputTime = inputTime.slice(0, j);
    }
    log.info('input time', v.quotes(inputTime));
    content = content.slice(j + 1).trim();
    log.info('content', v.quotes(content));
    var time;
    var timeFormat = 'NA';
    if (moment(inputTime, 'YYYY/MM/DD HH:mm', true).isValid()) {
        log.info('time can be parsed via date');
        time = moment.utc(inputTime, 'YYYY/MM/DD HH:mm').utcOffset(offset * (-1));
        timeFormat = time.utcOffset(0).format('YYYY/MM/DD HH:mm');
    } else if (moment(inputTime, 'YYYY/MM/DD H:mm', true).isValid()) {
        log.info('time can be parsed via date v2');
        time = moment.utc(inputTime, 'YYYY/MM/DD H:mm').utcOffset(offset * (-1));
        timeFormat = time.utcOffset(0).format('YYYY/MM/DD HH:mm');
    } else {

        var hour = parseInt(inputTime.slice(0, colon));

        var minute = parseInt(inputTime.slice(colon + 1, colon + 3)); //this is also the UTC minute

        var ampm = false;

        if (inputTime.slice(colon + 3, colon + 5).toLowerCase() == 'pm') {
            ampm = true;
            if (hour < 12) {
                log.info('pm, adding 12 hours to ' + hour);
                hour += 12;
                log.info('new hours ' + hour);
            }
        } else if (inputTime.slice(colon + 3, colon + 5).toLowerCase() == 'am') {
            ampm = true;
            if (hour == 12) {
                log.info('this is midnight');
                hour = 0;
            }
        }

        time = moment.utc();
        time.hour(hour).minute(minute);
        time.subtract(1, 'd').subtract(offset, 'minute');

        while (time.format('x') < Date.now()) {
            if (ampm) {
                time.add(1, 'd');

            } else {
                time.add(12, 'h');
            }
        }

        if (ampm) {
            timeFormat = time.utcOffset(offset).format('HH:mmA');
        } else {
            timeFormat = time.utcOffset(offset).format('HH:mm');
        }
    }

    var reminder = 'Reminder';
    if (name) {
        reminder = reminder + ' to ' + name;
    }
    reminder = reminder + ':\n' + content;

    var invalid = true;
    var key = time.format('x') + '_' + threadID;

    while (invalid) { //make sure the key does not exist already
        try {
            if (v.sBase.timezone_offset[key]) {
                time.add(1, 'ms');
                key = time.format('x') + '_' + threadID;
            } else {
                invalid = false;
            }
        } catch (err) {
            invalid = false;
        }
    }

    f.setData(api, message, v.f.SM.child(time.format('x') + '_' + threadID), reminder, 'Reminder set for ' + timeFormat + '\nTime difference: ' + moment(time).fromNow(true) + '\n' + content);
    setTimeout(function() {
        getScheduledMessages();
    }, 5000);
}

function checkTimeNotification(api) {
    if (scheduledMessageTime == 0) return;
    if (scheduledMessageTime < Date.now()) {
        var thread = scheduledMessageKey.slice(scheduledMessageKey.indexOf('_') + 1);
        api.sendMessage(v.sBase.scheduled_messages[scheduledMessageKey], thread, function callback(err) {
            if (err) {
                //getScheduledMessages takes time
                return;
            }
        });
        f.setDataSimple(v.f.SM.child(scheduledMessageKey), null, null);
    }
    getScheduledMessages();
    setTimeout(function() {
        checkTimeNotification(api);
    }, 5000);
}

function getScheduledMessages() {
    scheduledMessageTime = 0;
    try {
        if (v.sBase.scheduled_messages) {
            for (var s in v.sBase.scheduled_messages) {
                var time = s.slice(0, s.indexOf('_'));
                if (scheduledMessageTime == 0) {
                    scheduledMessageKey = s;
                    scheduledMessageTime = parseInt(time);
                }
                if (time < scheduledMessageTime) {
                    scheduledMessageKey = s;
                    scheduledMessageTime = parseInt(time);
                }
            }
            if (v.nextScheduledMessageNotif) {
                log.info('next scheduled message at ' + scheduledMessageTime + '   ' + moment(parseInt(scheduledMessageTime)).format('YYYY-MM-DD HH:mm:ss'));
                log.info('current time is ' + Date.now() + '             ' + moment().format('YYYY-MM-DD HH:mm:ss'));
                log.info('time remaining ' + moment(scheduledMessageTime).fromNow(true));
                v.nextScheduledMessageNotif = false;
            }
        } else {
            log.info('nothing in getScheduledMessages');
        }
    } catch (err) {
        log.info('getScheduledMessages error\n\n' + err);
    }
}

module.exports = {
    listener: listener,
    setTimezone: setTimezone,
    createTimeNotification: createTimeNotification,
    checkTimeNotification: checkTimeNotification,
    getScheduledMessages: getScheduledMessages
}
