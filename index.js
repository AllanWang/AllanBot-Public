'use strict';
var allanbotFirebase = require('./src/firebase');
var allanbotBasic = require('./src/basic');
var v = require('./src/globalVariables');

///FACEBOOK API STUFF - will be changed via setOptions
var api;

var log = require("npmlog");

//Bot stuff
var botName = 'AllanBot';
var botNameLowerCase = botName.toLowerCase();
var botID = 0;
var botNameLength = botName.length;

//Booleans that can be modified in enableFeatures
var bTalkBack = false;
var bEcho = false;
var bSpam = false;
var bHelp = true;
var bSavedText = false;
var bQuickNotifications = false;
var bTimeout = false;

//Extra permissions
var devMode = false;
var godMode = false;
var masterArray = [];
var devArray = [];

//FIREBASE STUFF
var firebaseOn = false;

//MOMENT STUFF
var moment = require('moment-timezone');

function setOptions(options) {
  Object.keys(options).map(function(key) {
    switch (key) {
      case 'logLevel':
        log.level = options.logLevel;
        break;
      case 'botName':
        var n = options.botName.toString();
        v.set('botName', n);
        botName = n;
        n = n.toLowerCase();
        v.set('botNameLowerCase', n);
        botNameLowerCase = n;
        v.set('botNameLength', n.length);
        botNameLength = n.length;
        break;
      case 'botID':
        v.set('botID', options.botID);
        botID = options.botID;
        break;
      case 'api':
        api = options.api;
        break;
      case 'pandoraID':
        allanbotBasic.enablePandora(options.pandoraID.toString());
        break;
      case 'firebase':
        allanbotFirebase.initializeFirebase(options.firebase);
        allanbotFirebase.setBase(options.firebase);
        firebaseOn = true;
        break;
      case 'masterArray':
        masterArray = options.masterArray;
        break;
      case 'devArray':
        devArray = options.devArray;
        break;
      default:
        log.warn('Unrecognized option given to setOptions', key);
        break;
    }
  });
  if (!api) {
    log.warn('API not received; nothing will work.');
  }
  if (botID == 0) {
    log.warn('BotID not set; enabling selfListen in the facebook chat api or using certain advanced functions may produce issues.');
  }
  if (!firebaseOn) {
    log.warn('Firebase is not set; a lot of features will not work');
  }
}

function enableFeatures(options) {
  Object.keys(options).map(function(key) {
    switch (key) {
      case 'talkBack':
        bTalkBack = options.talkBack;
        break;
      case 'echo':
        bEcho = options.echo;
        break;
      case 'quickNotifications':
        bQuickNotifications = options.quickNotifications;
        break;
      case 'spam':
        bSpam = options.spam;
        if (bSpam) {
          log.info('Spam is enabled; this is only for those with devMode');
        }
        break;
      case 'help':
        bHelp = options.help;
        break;
      case 'saveText':
        bSavedText = options.savedText;
        break;
      case 'timeout':
        bTimeout = options.timeout;
        break;
      default:
        log.warn('Unrecognized option given to enableFeatures', key);
        break;
    }
  });
}


function listen(message) {
  if (!message.body) { //no text
    return;
  }

  godMode = contains(masterArray, message.senderID);
  if (godMode) {
    log.info('user has godMode');
  }
  devMode = contains(devArray, message.senderID) || godMode;
  if (devMode && !godMode) {
    log.info('user has devMode');
  }


  var input = '';
  if (message.isGroup) {
    if ((message.body.toLowerCase().slice(0, botNameLength + 2) == '@' + botNameLowerCase + ' ') && message.body.length > (botNameLength + 2)) {
      input = message.body.slice(botNameLength+2);
    }
  } else {
    input = message.body;
  }

  if (input) {
    log.info('Input', input);
    if (bSpam && input.slice(0, 6) == '--spam' && input.length == 6) {
      if (devMode) {
        spam(api, message);
      } else {
        api.sendMessage('You do not have the power to do this.', message.threadID);
      }
    } else if (bHelp && input == '--help') {
      help(api, message);
    } else if (bEcho && input.slice(0, 7) == '--echo ' && input.length > 7) {
      var s = input.slice(7);
      if (!godMode) {
        if (s.slice(0,1) == '$') {
          api.sendMessage('You cannot run commands via echoing', message.threadID);
          return;
        } else if (s.slice(0,l + 1) == '@' + botName) {
          api.sendMessage("I don't want to echo myself.", message.threadID);
          return;
        }
      }
      allanbotBasic.echo(api, message, s);
    } else if (bSavedText) {
      if (input.slice(0, 7) == '--save ' && input.length > 7) {
        saveText(api, message, input.slice(7));
      } else if (input == '--saved') {
        try {
          if (sBase.savedMessages[message.threadID][message.senderID]) {
            api.sendMessage('Saved text:\n\n' + sBase.savedMessages[message.threadID][message.senderID], message.threadID);
          } else {
              api.sendMessage('No saved text found.', message.threadID);
          }
        } catch (err) {
          api.sendMessage('No saved text found.', message.threadID);
        }
      } else if (input == '--erase') {
        allanbotFirebase.setData(api, message, fSaved.child(message.threadID).child(message.senderID), null, 'Erased saved text');
      }
    } else if (bQuickNotifications) {
      if (input.toLowerCase() == '--eqn') {
        allanbotFirebase.setData(api, message, fQN.child(message.senderID), true, 'Quick notifications enabled.\nYou only need to do this once until you disable it.');
      } else if (input.toLowerCase() == '--dqn') {
        allanbotFirebase.setData(api, message, fQN.child(message.senderID), null, 'Quick notifications disabled.');
      }
    } else if (bTimeout && input == '!!!') {
      api.getUserInfo(message.senderID, function(err, ret) {
        if(err) return console.error(err);
        allanbotFirebase.userTimeout(api, message, message.senderID, ret[message.senderID].name);
      });
    } else if (input.slice(0,1) == '#') {
      chatColorChange(api, message, input);
    } else if (input == '--me') {
      api.getUserInfo(message.senderID, function(err, ret) {
        if(err) return console.error(err);
        var name = ret[message.senderID].firstName;
        allanbotFirebase.setData(api, message, fEndless.child(message.threadID).child(message.senderID), name, '@' + name + ' how are you?');
      });
    } else if (bTalkBack) {
      allanbotBasic.respondRequest(api, message, input);
    }
  }
}

//BASIC
function contains (message, value) {
  return (message.toString().toLowerCase().indexOf(value.toString().toLowerCase()) != -1);
}

module.exports = {
  //The essential functions
  setOptions: setOptions,
  enableFeatures: enableFeatures,
  listen: listen,
  //The behind the scene files that can be used by other developers
  allanbotBasic: allanbotBasic,
  allanbotFirebase: allanbotFirebase
}
