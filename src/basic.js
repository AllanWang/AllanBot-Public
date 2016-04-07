var rp = require('request-promise');
var xml2js = require('xml2js');
var pandoraEnabled = false;
var pandoraID;
var mitsukuMode = true;
var m = require('mitsuku-api')();
var log = require("npmlog");
var v = require('./globalVariables');

function echo(api, message, input) {
  api.sendMessage(input, message.threadID);
}

function enablePandora(id) {
  pandoraID = id;
  pandoraEnabled = true;
  mitsukuMode = false;
}

function respondRequest(api, message, input, prefix) {
  if (!mitsukuMode && pandoraEnabled) {
    try {
      pandoraRequest(api, message, input, prefix);
      return;
    } catch (err) {
      log.warn('Using Mitsuku');
    }
  }
  mitsukuRequest(api, message, input, prefix);
}

function pandoraRequest(api, message, input, prefix) {
  if (prefix === undefined) prefix = ''; //TODO check if necessary
	rp('http://www.pandorabots.com/pandora/talk-xml?botid=' + pandoraID + '&input='+encodeURIComponent(input)+'&custid='+message.threadID).then(function(response) {
		xml2js.parseString(response, function(err, result) {
			var reply = result.result.that[0];
			log.info(prefix + 'Replying: ' + reply);
			api.sendMessage(prefix + reply, message.threadID);
		});
	}).catch(function(error) {
    api.sendMessage('Pandora bot is down now. Switching to Mitsuku', message.threadID);
    mitsukuMode = true;
		log.error('------------ PANDORA ERROR ------------', error);
	});
}

function mitsukuRequest(api, message, input, prefix) {
  if (prefix === undefined) prefix = ''; //TODO check if necessary
  try {
    m.send(input.replace(/[v.botName]/ig, 'Mitsuku'))
    .then(function(response){
      response = (response + '').replace(/mitsuku/ig, v.botName); //renaming the bot :)
      log.info(prefix + 'Replying: ' + response);
      api.sendMessage(prefix + response, message.threadID);
    });
  } catch(err) {
		log.error('------------ MITSUKU ERROR ------------', error);
	}
}

module.exports = {
  echo: echo,
  enablePandora: enablePandora,
  respondRequest: respondRequest
}
