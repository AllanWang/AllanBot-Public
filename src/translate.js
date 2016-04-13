//Credits to Ivon Liu
var rp = require('request-promise');
var log = require("npmlog");

// Process the request
function translateRequest(fromLang, toLang, phrase, callback) {
    log.info('Translating', phrase, 'from', fromLang, 'to', toLang);
    translate(fromLang, toLang, phrase)
        .then(function(result) {
            callback(null, result);
        })
        .catch(function(err) {
            log.error('Translate error', err);
            return callback(err);
        })
}

// Actual translation method
function translate(fromLang, toLang, phrase) {
    var options = {
        method: 'GET',
        url: 'https://translate.googleapis.com/translate_a/single',
        qs: {
            client: 'gtx',
            sl: fromLang,
            tl: toLang,
            dt: 't',
            q: phrase
        },
        headers: {
            'cache-control': 'no-cache'
        }
    };
    return rp(options).then(function(response) {
        return response.match(/"(.*?)"/)[1]
    });
}

module.exports = {
    translateRequest: translateRequest
}