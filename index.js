'use strict';
var allanbotFirebase = require('./src/firebase');
var allanbotBasic = require('./src/basic');
var allanbotSaveText = require('./src/saveText');
var allanbotChatColour = require('./src/chatColour');
var v = require('./src/globalVariables');
var log = require("npmlog");

///FACEBOOK API STUFF - will be changed via setOptions
var api;

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
        v.botName = n;
        v.botNameLength = n.length;
        break;
      case 'botID':
        v.botID = options.botID;
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
  if (v.botID == 0) {
    log.warn('BotID not set; enabling selfListen in the facebook chat api or using certain advanced functions may produce issues.');
  }
  if (!v.firebaseOn) {
    log.warn('Firebase is not set; a lot of features will not work');
  }
}

function enableFeatures(options) {
  Object.keys(options).map(function(key) {
    switch (key) {
      case 'talkBack':
        v.b.talkBack = options.talkBack;
        break;
      case 'echo':
        v.b.echo = options.echo;
        break;
      case 'quickNotifications':
        v.b.quickNotifications = options.quickNotifications;
        break;
      case 'spam':
        v.b.spam = options.spam;
        if (bSpam) {
          log.info('Spam is enabled; this is only for those with devMode');
        }
        break;
      case 'help':
        v.b.help = options.help;
        break;
      case 'saveText':
        v.b.savedText = options.saveText;
        break;
      case 'timeout':
        v.b.timeout = options.timeout;
        break;
      case 'chatColor':
        v.b.chatColor = options.chatColor;
        break;
      case 'everything':
        v.setAll(options.everything);
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

  godMode = v.contains(masterArray, message.senderID);
  if (godMode) {
    log.info('user has godMode');
  }
  devMode = v.contains(devArray, message.senderID) || godMode;
  if (devMode && !godMode) {
    log.info('user has devMode');
  }

  //Listeners go here
  if (allanbotChatColour.colorSuggestionListener(api, message)) return;

  if (message.senderID == v.botID) {
    return; //stop listening to bot
  }


  //Input stuff goes here
  var input = '';
  if (message.isGroup) {
    if ((message.body.toLowerCase().slice(0, v.botNameLength + 2) == '@' + v.botName.toLowerCase() + ' ') && message.body.length > (v.botNameLength + 2)) {
      input = message.body.slice(v.botNameLength+2);
    }
  } else {
    input = message.body;
  }
  if (input) {
    log.info('Input', input);

    if (v.b.savedText) {
      if (input.slice(0, 7) == '--save ' && input.length > 7) {
        allanbotSaveText.saveText(api, message, input.slice(7));
        return;
      } else if (input == '--saved') {
        allanbotSaveText.getSavedText(api, message);
        return;
      } else if (input == '--erase') {
        allanbotFirebase.setData(api, message, 'fSaved', null, 'Erased saved text');
        return;
      }
    }

    if (v.b.quickNotifications) { //TODO add
      if (input.toLowerCase() == '--eqn') {
        allanbotFirebase.setData(api, message, 'fQN', true, 'Quick notifications enabled.\nYou only need to do this once until you disable it.');
        return;
      } else if (input.toLowerCase() == '--dqn') {
        allanbotFirebase.setData(api, message, 'fQN', null, 'Quick notifications disabled.');
        return;
      }
    }

    if (v.b.spam && input == '--spam') {
      if (devMode) {
        allanbotBasic.spam(api, message);
      } else {
        api.sendMessage('You do not have the power to do this.', message.threadID);
      }
    } else if (v.b.help && input == '--help') { //TODO add
      return v.wip(api, message);
      help(api, message);
    } else if (v.b.echo && input.slice(0, 7) == '--echo ' && input.length > 7) {
      var s = input.slice(7);
      if (!godMode) { //TODO add these things
        if (s.slice(0,1) == '$') {
          api.sendMessage('You cannot run commands via echoing', message.threadID);
          return;
        } else if (s.slice(0,v.botNameLength + 1).toLowerCase() == '@' + v.botName.toLowerCase()) {
          api.sendMessage("I don't want to echo myself.", message.threadID);
          return;
        }
      }
      allanbotBasic.echo(api, message, s);
    } else if (v.b.timeout && input == '!!!') {
      api.getUserInfo(message.senderID, function(err, ret) {
        if(err) return console.error(err);
        allanbotFirebase.userTimeout(api, message, message.senderID, ret[message.senderID].name);
      });
    } else if (v.b.chatColor && input.slice(0,1) == '#') { //TODO add
      allanbotChatColour.chatColorChange(api, message, input);
    } else if (input == '--me') { //TODO add
      api.getUserInfo(message.senderID, function(err, ret) {
        if(err) return console.error(err);
        var name = ret[message.senderID].firstName;
        allanbotFirebase.setData(api, message, 'fEndless', name, '@' + name + ' how are you?');
      });
    } else if (v.b.talkBack) {
      allanbotBasic.respondRequest(api, message, input);
    }
  }
}

module.exports = {
  //The essential functions
  setOptions: setOptions,
  enableFeatures: enableFeatures,
  listen: listen,
  //The behind the scene files that can be used by other developers
  allanbotBasic: allanbotBasic,
  allanbotFirebase: allanbotFirebase,
  allanbotSaveText: allanbotSaveText,
  allanbotChatColour: allanbotChatColour,
  v: v
}
