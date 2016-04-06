//FIREBASE STUFF
var Firebase = require("firebase");
var firebaseOn = false;
var myFirebaseRef, fBase, fBoolean, fOffline, fQN, fNick, fEndless, fSaved,
  fNotifications, fSM, fTimeZone, fConversations, fColorSuggestions, fMIW, fTimeout;
var moment = require('moment-timezone');

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
  console.log('firebase loaded!');
  firebaseOn = true;
}

function setDataSimple(fLocation, input, success) {
  console.log('starting setData');
  fLocation.set(input,
    function(error) {
      if (error) {
        console.log("Data could not be saved");
      } else if (success != null){
        console.log(success);
      }
  });
}

function setData(api, message, fLocation, input, success) {
  fLocation.set(input,
    function(error) {
      if (error) {
        api.sendMessage("Data could not be saved", message.threadID);
      } else if (success != null){
        api.sendMessage(success, message.threadID);
      }
  });
}

function saveText(api, message, input) {
  if (!firebaseOn) {
    console.log('firebase is not enabled, see initializeFirebase');
    return;
  }
  input = moment.utc().format('MM/DD/YYYY') + ": " + input;
  try {
    input = sBase.savedMessages[message.threadID][message.senderID] + "\n" + input;
    backup("savedMessages/" + message.threadID + "/" + message.senderID, sBase.savedMessages[message.threadID][message.senderID]);
  } catch (err) {
    //Do nothing, no previous input found
  }
  setData(api, message, fSaved.child(message.threadID).child(message.senderID), input, 'Saved text:\n' + input);
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
  setData: setData,
  setDataSimple: setDataSimple,
  saveText: saveText
}
