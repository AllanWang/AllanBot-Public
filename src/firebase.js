//FIREBASE STUFF
var Firebase = require("firebase");
var myFirebaseRef, fBase, fBoolean, fOffline, fQN, fNick, fEndless, fSaved,
  fNotifications, fSM, fTimeZone, fConversations, fColorSuggestions, fMIW, fTimeout;
var log = require("npmlog");
var v = require('./globalVariables');

function initializeFirebase(f) {
  fBase = f;
  fBoolean = fBase.child("boolean");
  fOffline = fBoolean.child("heroku_offline");
  fQN = fBoolean.child("quick_notify");
  fNick = fBase.child("nicknames");
  fEndless = fBoolean.child("endless_talk");
  fSaved = fBase.child("savedMessages");
  fNotifications = fBase.child("notificationMessages");
  fSM = fBase.child("scheduled_messages");
  fTimeZone = fBase.child("timezone_offset");
  fConversations = fBase.child("conversations");
  fColorSuggestions = fBase.child("colors_custom");
  fMIW = fBase.child("messages_in_waiting");
  fTimeout = fBoolean.child("timeout");
  log.info('firebase loaded!');
  v.firebaseOn = true;
}

function setBase(f) {
  f.on("value", function(snapshot) {
    v.sBase = snapshot.val();
    log.info('sBase updated');
  }, function (errorObject) {
    console.log("Error retrieving fBase " + errorObject.code);
  });
}

function setDataSimple(fLocation, input, success) {
  log.info('starting setData');
  fLocation.set(input,
    function(error) {
      if (error) {
        log.error("Data could not be saved");
      } else if (success != null){
        log.info(success);
      }
  });
}

function setData(api, message, fLocation, input, success) {
  switch (fLocation) { /////x
    case 'fSaved':
      fLocation = fSaved.child(message.threadID).child(message.senderID);
      break;
    case 'fQN':
      fLocation = fQN.child(message.senderID);
      break;
    case 'fEndless':
      fLocation = fEndless.child(message.threadID).child(message.senderID);
      break;
    default:
      log.info('setData on an unknown location; no switch used');
      break;
  }
  fLocation.set(input,
    function(error) {
      if (error) {
        api.sendMessage("Data could not be saved", message.threadID);
      } else if (success != null){
        api.sendMessage(success, message.threadID);
      }
  });
}

function setDataTimeout(api, message, thread, id, input, success) {
  setData(api, message, fTimeout.child(thread + '_' + id), input, success);
}

function setDataColor(api, message, colorSuggestionName, input, success) {
  setData(api, message, fColorSuggestions.child(message.threadID).child(colorSuggestionName), input, success);
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
  setDataTimeout: setDataTimeout,
  setDataColor: setDataColor
}
