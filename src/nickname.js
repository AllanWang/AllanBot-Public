var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');
var translate = require('./translate');

function listener(api, message, input) {
    v.section = 'nickname listener';
    if (input == '--nonickname' || input == '--nnickname') {
        return changeNickname(api, message, false);
    } else if (input == '--yesnickname' || input == '--ynickname') {
        return changeNickname(api, message, true);
    }
    changeNicknameBasic(api, message, input);
}

function changeNickname(api, message, t) {
    v.section = 'nickname changeNickname';
    v.continue = false;
    if (t) { //restore nicknames
        var nicknames = f.get('threads/' + message.threadID + '/nicknames');
        if (nicknames) {
            for (var n in nicknames) {
                api.changeNickname(nicknames[n], message.threadID, n, function callback(err) {
                    if (err) {
                        f.setDataSimple2('threads/' + message.threadID + '/nicknames/' + message.senderID, null, null);
                        log.error('changeNickname failed for ', n, 'removed nickname');
                    }
                });
            }
        } else {
            api.sendMessage('No nicknames saved.', message.threadID);
        }
    } else { //remove nicknames
        api.getThreadInfo(message.threadID, function callback(err, info) {
            if (err) return console.error(err);
            // log.info('info nick ' + info.nicknames.toString());
            for (var id in info.nicknames) {
                // console.log('id ' + id);
                f.setDataSimple2('threads/' + message.threadID + '/nicknames/' + id, info.nicknames[id], null);
                api.changeNickname('', message.threadID, id, function callback(err) {
                    if (err) return log.error(err);
                });

            }
        });
    }
}

function changeNicknameBasic(api, message, input) {
    v.section = 'nickname changeNicknameBasic';
    if (input.toLowerCase().slice(0, 8) != 'nickname') return;
    if (input.charAt(8) == ':') {
        v.continue = false;
        api.changeNickname(input.slice(9).trim(), message.threadID, message.senderID, function callback(err) {
            if (err) return console.error(err);
        });
        return;
    }
    if (input.charAt(8) == '~') {
        v.continue = false;
        var name = input.slice(9).trim();
        var name2 = '';
        translate.request('auto', 'en', name, function callback(err1, en) {
            if (err1) return console.error(err1);
            name2 += en + '/';
            translate.request('auto', 'fr', name, function callback(err2, fr) {
                if (err2) return console.error(err2);
                name2 += fr + '/';
                translate.request('auto', 'zh-CN', name, function callback(err3, ch) {
                    if (err3) return console.error(err3);
                    name2 += ch;
                    api.changeNickname(name2, message.threadID, message.senderID, function callback(err) {
                        if (err) return console.error(err);
                    });
                });
            });
        });
    }

}

module.exports = {
    listener: listener,
    changeNickname: changeNickname,
    changeNicknameBasic: changeNicknameBasic
}
