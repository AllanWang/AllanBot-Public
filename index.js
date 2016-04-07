'use strict';
var allanbotFirebase = require('./src/firebase');
var allanbotBasic = require('./src/basic');

///FACEBOOK API STUFF
var api;
var botName = 'allanbot';
var botID = 0;
var l = botName.length;
var log = require("npmlog");

var bTalkBack = false;
var bEcho = false;
var bSpam = false;
var bHelp = true;
var bSavedText = false;
var bQuickNotifications = false;

var devMode = false;
var godMode = false;

var masterArray = [];
var devArray = [];



//FIREBASE STUFF
var Firebase = require("firebase");
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
        botName = options.botName.toString().toLowerCase();
        l = botName.length;
        allanbotBasic.setBotName(options.botName.toString());
        break;
      case 'botID':
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
    log.warn('BotID not set; enabling selfListen in the facebook chat api may produce some issues.');
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
      default:
        log.warn('Unrecognized option given to enableFeatures', key);
        break;
    }
  });
}


function listen(message) {
  if (!message.body) {
    return;
  }

  godMode = contains(masterArray, message.senderID);
  if (godMode) {
    console.log('user has godMode');
  }
  devMode = contains(devArray, message.senderID) || godMode;
  if (devMode && !godMode) {
    console.log('user has devMode');
  }


  var input = '';
  if (message.isGroup) {
    if ((message.body.toLowerCase().slice(0, l + 2) == '@' + botName + ' ') && message.body.length > (l + 2)) {
      input = message.body.slice(l+2);
    }
  } else {
    input = message.body;
  }

  if (input) {
    if (bSpam && input.slice(0, 6) == '--spam' && input.length == 6) {
      if (devMode) {
        spam(api, message);
      } else {
        api.sendMessage('You do not have the power to do this.', message.threadID);
      }
    } else if (bHelp && input == '--help') {
      help(api, message);
    } else if (bEcho && input.slice(0, 7) == '--echo ' && input.length > 7) {
      if (!godMode) {
        var s = input.slice(7);
        if (s.slice(0,1) == '$') {
          api.sendMessage('You cannot run commands via echoing', message.threadID);
          return;
        } else if (s.slice(0,9) == '@allanbot') {
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
          getData(api, message, sBase.savedMessages[message.threadID][message.senderID], 'Saved text:');
        } catch (err) {
          api.sendMessage('No saved text found.', message.threadID);
        }
      } else if (input == '--erase') {
        setData(api, message, fSaved.child(message.threadID).child(message.senderID), null, 'Erased saved text');
      }
      return;
    } else if (bQuickNotifications) {
      if (input.toLowerCase() == '--eqn') {
        setData(api, message, fQN.child(message.senderID), true, 'Quick notifications enabled.\nYou only need to do this once until you disable it.');
      } else if (input.toLowerCase() == '--dqn') {
        setData(api, message, fQN.child(message.senderID), null, 'Quick notifications disabled.');
      }
      return;
    } else if (input == '!!!') {
      api.getUserInfo(message.senderID, function(err, ret) {
        if(err) return console.error(err);
        userTimeout(api, message, message.senderID, ret[message.senderID].name);
      });
    } else if (input.slice(0,1) == '#') {
      chatColorChange(api, message, input);
    } else if (input == '--me') {
      api.getUserInfo(message.senderID, function(err, ret) {
        if(err) return console.error(err);
        var name = ret[message.senderID].firstName;
        setData(api, message, fEndless.child(message.threadID).child(message.senderID), name, '@' + name + ' how are you?');
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
