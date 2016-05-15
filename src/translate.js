//http request is credits to Ivon Liu
var rp = require('request-promise');
var log = require("npmlog");
var v = require('./globalVariables');
var invalid = ''; //will be used in the functions

/** Translation helpers **/
var langKey = ['auto', 'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny', 'zh-CN', 'co', 'hr', 'cs', 'da',
    'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu',
    'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my',
    'ne', 'no', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv',
    'tg', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu'
];
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
    v.section = 'translate getLanKey';
    if (s in langMap) return langMap[s];
    if (langKey.indexOf(s) != -1) return s;
    invalid = s;
    return 'auto';
}

function listener(api, message, input) {
    v.section = 'translate listener';
    if (input.trim() == '-t') {
        api.sendMessage(printLangKey(), message.threadID);
    } else if (input.slice(0, 4) == '-tk ') {
        getShortKey(api, message, input.slice(4));
    } else if (input.slice(0, 3) == '-t ' && input.length > 6) {
        parse(api, message, input.slice(3));
    }
}


function getShortKey(api, message, input) {
    v.section = 'translate getShortKey';
    v.continue = false;
    input = input.trim();
    if (!langMap[input]) {
        api.sendMessage(input + ' is an invalid key.', message.threadID);
    } else {
        api.sendMessage(input + "'s key is " + langMap[input], message.threadID);
    }
}

function printLangKey() {
    v.section = 'translate printLangKey';
    v.continue = false;
    var s = 'Available languages:\n\n';
    // var t = '\n\n';
    for (var l in langMap) {
        s += l + '   ';
        // t += "'" + langMap[l] + "', ";
    }
    return s;
}

// Process the request
function request(fromLang, toLang, phrase, callback) {
    v.section = 'translate request';
    invalid = '';
    fromLang = getLanKey(fromLang);
    toLang = getLanKey(toLang);
    if (invalid) {
        callback(null, invalid + ' is not a valid language/key');
        return;
    }
    // log.info('Translating', phrase, 'from', fromLang, 'to', toLang);
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
    v.section = 'translate parse';
    v.continue = false;
    input = input.trim();
    var l = input.split(' ')[0]
    var fromLang = 'auto';
    var toLang;
    if (v.contains(l, ':')) {
        fromLang = l.split(':')[0];
        toLang = l.split(':')[1];
    } else {
        toLang = l;
    }

    // log.warn('from', fromLang, 'to', toLang, 'c', input.slice(input.indexOf(' ') + 1));
    request(fromLang, toLang, input.slice(input.indexOf(' ') + 1), function callback(err, response) {
        api.sendMessage(response, message.threadID);
    });

}

// Actual translation method
function translate(fromLang, toLang, phrase) {
    v.section = 'translate translate';
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
            // q: encodeURIComponent(phrase)
            q: phrase
        },
        headers: {
            'cache-control': 'no-cache'
        }
    };
    // log.info('url', options)
    return rp(options).then(function(response) {
        var text = response.match(/"(.*?)"/)[1];
        // text = decodeURIComponent(text.replace(/% /g, '%'));
        // try {
        //     log.info('response', JSON.stringify(response));
        // } catch (err) {
        //     log.warn('response not decoded');
        // }
        return text;
    });
}

module.exports = {
    listener: listener,
    request: request,
    parse: parse
}
