var rp = require('request-promise');
var xml2js = require('xml2js');
var pandoraID;
var m = require('mitsuku-api')();
var log = require("npmlog");
var v = require('./globalVariables');

function notifyMention(api, message) {
    if (!v.myName) {
        log.warn('Name not set; check "myName"');
        return;
    }
    if (v.contains(message.body, v.myName) && !v.contains(message.body, v.botName) && !v.contains(message.body, "@" + v.myName) && !v.godMode &&
        !v.contains(v.ignoreArray, message.senderID)) {
        api.getUserInfo(message.senderID, function(err, ret) {
            if (err) return console.error(err);
            api.getThreadInfo(message.threadID, function callback(err, info) {
                if (err) return console.error(err);
                api.sendMessage('From ' + ret[message.senderID].name + ' in ' + info.name + ':\n\n' + message.body, v.myID);
            });
        });
    }
}

function enablePandora(id) {
    pandoraID = id;
    v.pandoraEnabled = true;
    v.mitsukuMode = false;
}

function respondRequest(api, message, input, prefix) {
    if (v.isMuted) return;
    if (message.senderID == v.botID) return;
    if (input.trim() == ' ' || input.trim() == '') return;
    if (input.length > 250) {
        input = input.slice(0, 250);
        log.info('Shortening input before respondRequest');
    }
    if (!v.mitsukuMode && v.pandoraEnabled) {
        try {
            pandoraRequest(api, message, input, prefix);
            return;
        } catch (err) {
            log.warn('Using Mitsuku');
        }
    }
    mitsukuRequest(api, message, input, prefix);
}

function respondSwitch(api, message, input) {
    if (!v.pandoraEnabled) return;
    if (input == '--mitsuku') {
        v.continue = false;
        v.mitsukuMode = true;
        api.sendMessage('I will now respond through Mitsuku.', message.threadID);
    } else if (input == '--pandora') {
        v.continue = false;
        v.mitsukuMode = false;
        api.sendMessage('I will now respond through Pandora.', message.threadID);
    }
}

function pandoraRequest(api, message, input, prefix) {
    if (!prefix) prefix = '';
    rp('http://www.pandorabots.com/pandora/talk-xml?botid=' + pandoraID + '&input=' + encodeURIComponent(input) + '&custid=' + message.threadID)
        .then(function(response) {
            xml2js.parseString(response, function(err, result) {
                var reply = result.result.that[0];
                log.info(prefix + 'Replying:', reply);
                api.sendMessage(prefix + reply, message.threadID);
            });
        }).catch(function(error) {
            api.sendMessage('Pandora bot is down now. Switching to Mitsuku', message.threadID);
            v.mitsukuMode = true;
            log.error('------------ PANDORA ERROR ------------\n', error);
        });
}

function mitsukuRequest(api, message, input, prefix) {
    if (!prefix) prefix = '';
    try {
        m.send(input.replace(/[v.botName]/ig, 'Mitsuku'))
            .then(function(response) {
                response = (response + '').replace(/mitsuku/ig, v.botName); //renaming the bot :)
                log.info(prefix + 'Replying M:', response);
                api.sendMessage(prefix + response, message.threadID);
            });
    } catch (err) {
        log.error('------------ MITSUKU ERROR ------------\n', error);
    }
}

function muteToggle(api, message) {
    if (v.contains(message.body, '--mute')) {
        if (!v.isMuted) {
            v.isMuted = true;
            api.sendMessage(v.botName + ' muted.', message.threadID);
        } else {
            api.sendMessage(v.botName + ' is already muted.', message.threadID);
        }
        v.continue = false;
    } else if (v.contains(message.body, '--unmute')) {
        if (v.isMuted) {
            v.isMuted = false;
            api.sendMessage(v.botName + ' unmuted.', message.threadID);
        } else {
            api.sendMessage(v.botName + ' is already unmuted.', message.threadID);
        }
        v.continue = false;
    }
}

module.exports = {
    enablePandora: enablePandora,
    respondRequest: respondRequest,
    notifyMention: notifyMention,
    muteToggle: muteToggle,
    respondSwitch: respondSwitch
}
