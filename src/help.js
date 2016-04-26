var log = require("npmlog");
var v = require('./globalVariables');
var helpBoolean = 0;
var i = 0;

var index = ['saveText', 'translate', 'quickNotifications', 'remind', 'quote', 'chatColour', 'chatTitle', 'nickname', 'echo', 'endlessTalk'];
var numbers = {};

var title = {
    echo: 'Using echo',
    endlessTalk: 'Direct responses',
    saveText: 'Saving text',
    chatColour: 'Chat colours',
    quickNotifications: 'Quick notifications',
    userTimeout: 'User timeout',
    remind: 'Reminders',
    nickname: 'Chat nicknames',
    chatTitle: 'Chat title',
    translate: 'Translate',
    quote: 'Quote/Find'
        // indirect: '',
        // translate,
};

//add emoji
// helpArray = [text, save, notify, colors, emoji, me, reminders, echo, title, nickname];

var info = {};

///help
/*
function help(api, message) {
    var intro = 'AllanBot is a Facebook Chat Bot that can be called by using "@allanbot [message]"\n\nIt also has the following features:';
    var keywords = '\n\nSome chats have keywords that will trigger certain responses.';
    var emoji = '\n\n"emoji [emoji here]" will change the change emoji.';
    var title = '\n\n"title: [title]" will change the chat title; limit is 250 characters';

}
*/

function menu(api, message) {
    v.continue = false;
    i = 0;
    numbers = {};
    var sTitle = 'Please type the number corresponding to what you wish to know about.\n\n0. Complete instructions';
    for (var c = 0; c < index.length; c++) {
        if (v.b[index[c]]) {
            i++;
            numbers[i] = index[c];
            sTitle += '\n' + i + '. ' + title[index[c]];
        }
    }

    helpBoolean = message.senderID;
    api.sendMessage(sTitle, message.threadID);
    var atbot = '"@' + v.botNameL;
    info = {
        echo: atbot + ' --echo [text]" will have ' + v.botName + ' repeat that text verbatim.',

        endlessTalk: atbot + ' --me" will get ' + v.botName + ' to automatically respond to you, without you having to type ' + atbot +
            '" in the future. You can type "stop" to disable this afterwards.',

        saveText: atbot +
            ' --save xxx" will save the input xxx with a timestamp. These saved messages are specific to each conversation,' +
            ' and are not related to other messages you save in other messages.\n' +
            atbot + '--saved " will show the saved input.\n' + atbot + ' --erase" will erase the saved input.',

        chatColour: atbot +
            ' #000000" will change the chat colour to 000000. That colour can be any 6 digit hex colour, or the name of a colour.',

        quickNotifications: 'You need to type ' + atbot + ' --eqn" to enable this feature.\n' + atbot +
            ' @[name]: [content]" will notify [name] once he/she responds to ensure that the message is viewed.\n' + atbot +
            '--dqn " will disable this feature.',

        remind: atbot + ' remind [name] @[time] [content]" will create a reminder for [name] in the future.' +
            '\n[time] can be formatted by HH: mm or by a full date(YYYY / MM / DD HH: mm)',

        nickname: atbot + ' nickname: [nickname]" will change your nickname to [nickname]; leave it blank (nickname: ) to remove your nickname',

        chatTitle: atbot + ' title: [title]" will change the conversation title',

        translate: atbot +
            ' -t [language] [text]" will translate [text]. [language] may either be the language you are translating to, or [input]:[output] (ie @' +
            v.botNameL + '-t french:russian bonjour)\n' + atbot + ' - t " will display all the available languages',

        quote: atbot + ' --find [text]" will display the latest message starting with or containing [text].\n' + atbot +
            ' --quote [text]" will do the same thing but will also save it \nYou may view the saved quotes via ' + atbot +
            '--quotes " or ' + atbot +
            ' --all quotes" to see the quotes saved by everyone in this conversation.'
    };

    if (v.devMode) {
        info.nickname = info.nickname + '\n~~~ Dev features ~~~\n' + atbot +
            ' --nonickname" will remove all nicknames and save them to firebase\
        \n' + atbot +
            ' --yesnickname" will restore the nicknames if they were saved';
    }
}

function specific(api, message) {
    if (helpBoolean != message.senderID) return;
    helpBoolean = 0;
    v.continue = false;
    var num = parseInt(message.body);
    if (isNaN(num)) return;
    var full = '';
    if (num == 0) {
        full = v.botName + ' is a Facebook Chat Bot that can be called by using "@' + v.botNameL +
            ' [message]"\n\nIt also has the following features:';
        for (var c = 1; c <= i; c++) {
            full += '\n\n' + info[numbers[c]];
        }
    } else {
        full = info[numbers[num]];
    }
    api.sendMessage(full, message.threadID);
}

module.exports = {
    menu: menu,
    specific: specific
}
