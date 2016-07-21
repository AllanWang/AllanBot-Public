var log = require("npmlog");

var featureBooleans = {
    errorNotifications: false,
    talkBack: false
};

module.exports = {
    botName: null,
    botNameL: null,
    myID: null,
    myName: null,
    botID: null,
    botNameLength: null,
    welcomeMessage: null,
    firebaseOn: false,
    continue: true,
    section: null,
    pandoraEnabled: false,
    mitsukuMode: true,
    isMuted: false,
    nextScheduledMessageNotif: true,
    godMode: false,
    reminders: false,
    devMode: false,
    ignoreArray: [],
    sBase: null,
    fBase: null,
    b: featureBooleans,
    contains: function(message, value) {
        return (message.toString().toLowerCase().indexOf(value.toString().toLowerCase()) != -1);
    },
    wip: function(api, message) {
        api.sendMessage('This function is currently WIP', message.threadID);
    },
    quotes: function(s) {
        s = '"' + s + '"';
        return s;
    },
    isBotName: function(name) {
        return (name.slice(name.length - 3).toLowerCase() == 'bot');
    }
}
