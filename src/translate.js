//http request is credits to Ivon Liu
var rp = require('request-promise');
var log = require("npmlog");
var v = require('./globalVariables');

/** Translation helpers **/
var langMap = {
    afrikaans: 'af',
    albanian: 'sq',
    amharic: 'am',
    arabic: 'ar',
    armenian: 'hy',
    azerbaijani: 'az',
    basque: 'eu',
    belarusian: 'be',
    bengali: 'bn',
    bosnian: 'bs',
    bulgarian: 'bg',
    catalan: 'ca',
    cebuano: 'ceb',
    chichewa: 'ny',
    chinese: 'zh-CN',
    corsican: 'co',
    croatian: 'hr',
    czech: 'cs',
    danish: 'da',
    dutch: 'nl',
    english: 'en',
    esperanto: 'eo',
    estonian: 'et',
    filipino: 'tl',
    finnish: 'fi',
    french: 'fr',
    frisian: 'fy',
    galician: 'gl',
    georgian: 'ka',
    german: 'de',
    greek: 'el',
    gujarati: 'gu',
    haitian_creole: 'ht',
    hausa: 'ha',
    hawaiian: 'haw',
    hebrew: 'iw',
    hindi: 'hi',
    hmong: 'hmn',
    hungarian: 'hu',
    icelandic: 'is',
    igbo: 'ig',
    indonesian: 'id',
    irish: 'ga',
    italian: 'it',
    japanese: 'ja',
    javanese: 'jw',
    kannada: 'kn',
    kazakh: 'kk',
    khmer: 'km',
    korean: 'ko',
    kurdish: 'ku',
    kyrgyz: 'ky',
    lao: 'lo',
    latin: 'la',
    latvian: 'lv',
    lithuanian: 'lt',
    luxembourgish: 'lb',
    macedonian: 'mk',
    malagasy: 'mg',
    malay: 'ms',
    malayalam: 'ml',
    maltese: 'mt',
    maori: 'mi',
    marathi: 'mr',
    mongolian: 'mn',
    myanmar: 'my',
    nepali: 'ne',
    norwegian: 'no',
    pashto: 'ps',
    persian: 'fa',
    polish: 'pl',
    portuguese: 'pt',
    punjabi: 'pa',
    romanian: 'ro',
    russian: 'ru',
    samoan: 'sm',
    scots_gaelic: 'gd',
    serbian: 'sr',
    sesotho: 'st',
    shona: 'sn',
    sindhi: 'sd',
    sinhala: 'si',
    slovak: 'sk',
    slovenian: 'sl',
    somali: 'so',
    spanish: 'es',
    sundanese: 'su',
    swahili: 'sw',
    swedish: 'sv',
    tajik: 'tg',
    tamil: 'ta',
    telugu: 'te',
    thai: 'th',
    turkish: 'tr',
    ukrainian: 'uk',
    urdu: 'ur',
    uzbek: 'uz',
    vietnamese: 'vi',
    welsh: 'cy',
    xhosa: 'xh',
    yiddish: 'yi',
    yoruba: 'yo',
    zulu: 'zu'
}

function getLanKey(s) {
    if (s in langMap) return langMap[s];
    return s;
}

// Process the request
function translateRequest(fromLang, toLang, phrase, callback) {
    fromLang = getLanKey(fromLang);
    toLang = getLanKey(toLang);
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

function parse(api, message, input) {
    if (input.slice(0, 3) != '-t ') return;
    v.continue = false;
    input = input.slice(3).trim();
    var l = input.split(' ')[0]
    var fromLang = 'auto';
    var toLang;
    if (v.contains(l, ':')) {
        fromLang = l.split(':')[0];
        toLang = l.split(':')[1];
    } else {
        toLang = l;
    }
    log.info('from', fromLang, 'to', toLang, 'c', input.slice(input.indexOf(' ') + 1));
    translateRequest(fromLang, toLang, input.slice(input.indexOf(' ') + 1), function callback(err, response) {
        api.sendMessage(response, message.threadID);
    });

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
    translateRequest: translateRequest,
    parse: parse
}
