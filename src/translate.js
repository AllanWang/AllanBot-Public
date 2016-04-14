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
    /*Sample url
    https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=[text]
    */
    var options = {
        method: 'GET',
        url: 'https://translate.googleapis.com/translate_a/single',
        qs: {
            client: 'gtx',
            sl: fromLang,
            tl: toLang,
            dt: 't',
            q: encodeURIComponent(phrase)
                // q: phrase
        },
        headers: {
            'cache-control': 'no-cache'
        }
    };
    log.info('url', options)
    return rp(options).then(function(response) {
        var text = response.match(/"(.*?)"/)[1];
        text = decodeURIComponent(text.replace(/% /g, '%'));
        try {
            log.info('response', JSON.stringify(response));
        } catch (err) {
            log.warn('response not decoded');
        }
        return text;
    });
}

module.exports = {
    translateRequest: translateRequest
}