var rp = require('request-promise');
var xml2js = require('xml2js');
var pandoraEnabled = false;
var pandoraID;
var mitsukuMode = true;
var botName = 'AllanBot';
var m = require('mitsuku-api')();

function echo(api, message, input) {
  api.sendMessage(input, message.threadID);
}

function enablePandora(id) {
  pandoraID = id;
  pandoraEnabled = true;
  mitsukuMode = false;
}

function setBotName(n) {
  botName = n;
}

function respondRequest(api, message, input, prefix) {
  if (!mitsukuMode && pandoraEnabled) {
    try {
      pandoraRequest(api, message, input, prefix);
      return;
    } catch (err) {
      console.log('Using Mitsuku');
    }
  }
  mitsukuRequest(api, message, input, prefix);
}

function pandoraRequest(api, message, input, prefix) {
  if (prefix === undefined) prefix = ''; //TODO check if necessary
	rp('http://www.pandorabots.com/pandora/talk-xml?botid=' + pandoraID + '&input='+encodeURIComponent(input)+'&custid='+message.threadID).then(function(response) {
		xml2js.parseString(response, function(err, result) {
			var reply = result.result.that[0];
			console.log(prefix + 'Replying: ' + reply);
			api.sendMessage(prefix + reply, message.threadID);
		});
	}).catch(function(error) {
    api.sendMessage('Pandora bot is down now. Switching to Mitsuku', message.threadID);
    mitsukuMode = true;
		console.log('------------ PANDORA ERROR ------------');
    console.log(error);
    console.log('---------- PANDORA ERROR END ----------');
	});
}

function mitsukuRequest(api, message, input, prefix) {
  if (prefix === undefined) prefix = ''; //TODO check if necessary
  try {
    m.send(input.replace(/[botName]/ig, 'Mitsuku'))
    .then(function(response){
      response = (response + '').replace(/mitsuku/ig, botName); //renaming the bot :)
      console.log(prefix + 'Replying: ' + response);
      api.sendMessage(prefix + response, message.threadID);
    });
  } catch(err) {
		console.log('------------ MITSUKU ERROR ------------');
    console.log(error);
    console.log('---------- MITSUKU ERROR END ----------');
	}
}

module.exports = {
  echo: echo,
  enablePandora: enablePandora,
  setBotName: setBotName,
  respondRequest: respondRequest
}
