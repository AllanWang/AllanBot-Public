//FIREBASE STUFF
var Firebase = require("firebase");
var firebaseOn = false;
var myFirebaseRef, fBase, fBoolean, fOffline, fQN, fNick, fEndless, fSaved,
  fNotifications, fSM, fTimeZone, fConversations, fColorSuggestions, fMIW, fTimeout,
  sBase;
var moment = require('moment-timezone');
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
  firebaseOn = true;
}

function setBase(f) {
  f.on("value", function(snapshot) {
    sBase = snapshot.val();
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
    log.error('firebase is not enabled, see initializeFirebase');
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

//timeout
function userTimeout(api, message, id, name) {
  if (id == v.botID) {
    api.sendMessage("Sorry, I don't want to ban myself.", message.threadID);
    return;
  }
  setData(api, message, fTimeout.child(message.threadID + '_' + id), name, name + ", you have been banned for 5 minutes.");
  try {
    api.sendMessage('You have been banned from ' + message.threadName + ' for 5 minutes', id);
  } catch (err) {
    api.sendMessage("I couldn't notify " + name + " about being banned from " + message.threadName, allanID);
  }
  setTimeout(function () {
    api.removeUserFromGroup(id, message.threadID, function callback(err) {
      if (err) return console.error(err);
    });
  }, 2000);

  setTimeout(function () {
      userUnTimeout(api, message, id, name, message.threadID);
  }, 300000);
}

function userUnTimeout(api, message, id, name, thread) {
  api.addUserToGroup(id, thread, function callback(err) {
    if (err) { //TODO see if this is fixed; api issue
      // api.sendMessage("uh... I can't add " + name + " back", message.threadID);
      api.sendMessage('Welcome back ' + name + '; try not to get banned again.', thread);
      setData(api, message, fTimeout.child(thread + '_' + id), null, null);
      return console.error(err);
      //facebook error
    }

    api.sendMessage('Welcome back ' + name + '; try not to get banned again.', thread);
    setData(api, message, fTimeout.child(thread + '_' + id), null, null);
  });
}

module.exports = {
  initializeFirebase: initializeFirebase,
  setBase: setBase,
  setData: setData,
  setDataSimple: setDataSimple,
  saveText: saveText,
  userTimeout: userTimeout,
  userUnTimeout: userUnTimeout

}
