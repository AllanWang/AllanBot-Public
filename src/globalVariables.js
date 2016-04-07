var featureBooleans = {
  talkBack: false,
  echo: false,
  spam: false,
  help: true,
  savedText: false,
  quickNotifications: false,
  timeout: false,
  chatColor: false
};

module.exports = {
  botName: 'AllanBot',
  botID: 0,
  botNameLength: 9,
  firebaseOn: false,
  pandoraEnabled: false,
  isMuted: false,
  sBase: 'placeholder',
  b: featureBooleans,
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
  },
  colorSuggestionBoolean: 0,
  colorSuggestionName: ''


}
