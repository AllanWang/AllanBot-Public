var fBase, fBoolean;
var log = require("npmlog");
var v = require('./globalVariables');

function initializeFirebase(f) {
    v.section = 'firebase initializeFirebase';
    fBase = f;
    v.fBase = f;
    v.f.Users = fBase.child('users');
    v.f.Threads = fBase.child('threads');
    fBoolean = fBase.child("boolean");
    v.f.Offline = fBoolean.child("bot_offline");
    v.f.QN = fBoolean.child("quick_notify");
    v.f.Nick = fBase.child("nicknames");
    v.f.Endless = fBoolean.child("endless_talk");
    v.f.Saved = fBase.child("savedMessages");
    v.f.Notifications = fBase.child("notificationMessages");
    v.f.SM = fBase.child("scheduled_messages");
    v.f.TimeZone = fBase.child("timezone_offset");
    v.f.Conversations = fBase.child("conversations");
    v.f.ColorSuggestions = fBase.child("colors_custom");
    v.f.MIW = fBase.child("messages_in_waiting");
    v.f.Timeout = fBoolean.child("timeout");
    v.f.Quote = fBase.child("quotes");
    log.info('firebase loaded!');
    v.firebaseOn = true;
}

function setBase(f) {
    v.section = 'firebase setBase';
    f.on("value", function(snapshot) {
        v.sBase = snapshot.val();
        log.info('sBase updated');
    }, function(errorObject) {
        console.log("Error retrieving fBase " + errorObject.code);
    });
}

function setDataSimple(fLocation, input, success) {
    log.info('starting setData');
    fLocation.set(input,
        function(error) {
            if (error) {
                log.error("Data could not be saved");
            } else if (success != null) {
                log.info(success);
            }
        });
}

function setData(api, message, fLocation, input, success) {
    fLocation.set(input,
        function(error) {
            if (error) {
                api.sendMessage("Data could not be saved", message.threadID);
            } else if (success != null) {
                api.sendMessage(success, message.threadID);
            }
        });
}

function setData2(api, message, location, input, success) {
    if (input == get(location)) {
        if (success) api.sendMessage('Data has not changed from previously saved input.', message.threadID);
        return;
    }
    var fLocation = fBase;
    var segments = location.split('/');
    for (var i = 0; i < segments.length; i++) {
        fLocation = fLocation.child(segments[i]);
    }
    fLocation.set(input,
        function(error) {
            if (error) {
                api.sendMessage("Data could not be saved", message.threadID);
            } else if (success != null) {
                api.sendMessage(success, message.threadID);
            }
        });
}

function setDataSimple2(location, input, success) {
    if (input == get(location)) return;
    var fLocation = fBase;
    var segments = location.split('/');
    for (var i = 0; i < segments.length; i++) {
        fLocation = fLocation.child(segments[i]);
    }
    fLocation.set(input,
        function(error) {
            if (error) {
                log.error("Data could not be saved");
            } else if (success) {
                log.info(success);
            }
        });
}

function get(location) {
    var segments = location.split('/');
    var current = v.sBase;
    try {
        for (var i = 0; i < segments.length; i++) {
            current = current[segments[i]];
            if (!current) return null;
        }
    } catch (err) {
        log.warn(location, 'is an invalid directory for sBase');
        return null;
    }
    return current;
}

function backup(child, input) {
    fBase.child("backup").child(child).set(input,
        function(error) {
            if (error) {
                api.sendMessage("Data could not be saved", message.threadID);
            }
        });
}


module.exports = {
    initializeFirebase: initializeFirebase,
    backup: backup,
    setBase: setBase,
    setData: setData,
    setData2: setData2,
    setDataSimple: setDataSimple,
    setDataSimple2: setDataSimple2,
    get: get
}
