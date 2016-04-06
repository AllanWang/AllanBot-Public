'use strict';
var allanbotFirebase = require('./src/firebase');
var allanbotBasic = require('./src/basic');

///FACEBOOK API STUFF
var api;
var botName = 'allanbot';

//FIREBASE STUFF
var Firebase = require("firebase");
var firebaseOn = false;
var myFirebaseRef, fBase, fBoolean, fOffline, fQN, fNick, fEndless, fSaved,
  fNotifications, fSM, fTimeZone, fConversations, fColorSuggestions, fMIW, fTimeout;

//MOMENT STUFF
var moment = require('moment-timezone');

function initializeFCA(a, n) {
  api = a;
  botName = n.toLowerCase();
  console.log('api received for ' + botName);
}

function validateAPI() {
  if (api == null) {
    console.log('api not initialized, see initializeFCA');
  }
}
//BASIC
function contains (message, value) {
  return (message.toString().toLowerCase().indexOf(value.toString().toLowerCase()) != -1);
}

function echo(message) {
  if (contains(message.body.toLowerCase(), '@' + botName + ' --echo ')) {
    var i = message.body.toLowerCase().indexOf('--echo');
    console.log('i ' + i);
    allanbotBasic.echo(api, message, message.body.slice(i + 7));
  }
}

//FIREBASE
function initializeFirebase(f) {
  allanbotFirebase.initializeFirebase(f);
};
function setDataSimple(fLocation, input, success) {
  allanbotFirebase.setDataSimple(fLocation, input, success);
}
function setData(message, fLocation, input, success) {
  validateAPI();
  allanbotFirebase.setData(api, message, fLocation, input, success);
}
function saveText(message, input) {
  validateAPI();
  allanbotFirebase.saveText(api, message, input);
}

// if (!firebaseOn) {
//   console.log('firebase is not enabled, see initializeFirebase');
//   return;
// }

module.exports = {
  initializeFCA: initializeFCA,
  initializeFirebase: initializeFirebase,
  setDataSimple: setDataSimple,
  setData: setData,
  saveText: saveText,
  echo: echo
}
