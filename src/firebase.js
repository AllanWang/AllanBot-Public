var fBase, fBoolean;
var log = require("npmlog");
var v = require('./globalVariables');

function initializeFirebase(f) {
    v.section = 'firebase initializeFirebase';
    fBase = f;
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

function setData(api, message, location, input, success) {
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

function setDataSimple(location, input, success) {
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
    setDataSimple: setDataSimple,
    get: get
}
