var featureBooleans = {
    talkBack: false,
    echo: false,
    spam: false,
    help: true,
    savedText: false,
    quickNotifications: false,
    notifyMention: false,
    endlessTalk: false,
    timeout: false,
    chatColor: false
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
    Timeout: null
}

module.exports = {
    botName: null,
    botNameL: null,
    myID: null,
    myName: null,
    botID: null,
    botNameLength: null,
    firebaseOn: false,
    pandoraEnabled: false,
    isMuted: false,
    godMode: false,
    devMode: false,
    ignoreArray: null,
    sBase: null,
    b: featureBooleans,
    f: firebase,
    setAll: function(v) {
        for (var b in featureBooleans) {
            featureBooleans[b] = v;
        }
    },
    contains: function(message, value) {
        return (message.toString().toLowerCase().indexOf(value.toString().toLowerCase()) != -1);
    },
    wip: function(api, message) {
        api.sendMessage('This function is currently WIP', message.threadID);
    }


}