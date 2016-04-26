var featureBooleans = {
    talkBack: false,
    echo: false,
    spam: false,
    notifyMention: false
};

var firebase = {
    Offline: null,
    QN: null,
    Nick: null,
    Endless: null,
    Saved: null,
    Notifications: null,
    SM: null,
    TimeZone: null,
    Conversations: null,
    ColorSuggestions: null,
    MIW: null,
    Timeout: null,
    Quote: null
}

module.exports = {
    botName: null,
    botNameL: null,
    myID: null,
    myName: null,
    botID: null,
    botNameLength: null,
    firebaseOn: false,
    continue: true,
    pandoraEnabled: false,
    mitsukuMode: true,
    isMuted: false,
    nextScheduledMessageNotif: true,
    godMode: false,
    reminders: false,
    devMode: false,
    ignoreArray: [],
    sBase: null,
    b: featureBooleans,
    f: firebase,
    contains: function(message, value) {
        return (message.toString().toLowerCase().indexOf(value.toString().toLowerCase()) != -1);
    },
    wip: function(api, message) {
        api.sendMessage('This function is currently WIP', message.threadID);
    },
    quotes: function(s) {
        s = '"' + s + '"';
        return s;
    }


}
