var log = require("npmlog");
var v = require('./globalVariables');
var f = require('./firebase');

var colorSuggestionBoolean = 0; //no longer a boolean but I'll keep the name.
var colorSuggestionName = '';
var colorList = ['#0084ff', '#44bec7', '#fa3c4c', '#d696bb', '#6699cc', '#13cf13', '#ff7e29', '#e68585', '#7646ff', '#20cef5', '#ff5ca1'];

function chatColorChange(api, message, input) {
    var hex = 'placeholder';
    if (input.slice(1) == 'random') {
        var index = Math.floor(Math.random() * (colorList.length - 1)); //min value is 0, max value is inclusive
        hex = colorList[index];
    } else {
        var color = new RGBColor(input.slice(1));
        if (color.ok) { // 'ok' is true when the parsing was a success
            hex = color.toHex();
        } else {
            try {
                if (v.sBase.colors_custom[message.threadID][input.slice(1).replace(/\s+/g, '')] != null) {
                    hex = v.sBase.colors_custom[message.threadID][input.slice(1).replace(/\s+/g, '')];
                } else {
                    //color not found
                    api.sendMessage('I cannot change the chat color to ' + input.slice(1) + ".\n\nWould you like to suggest a color for this?\n(Make sure it's a 6 digit hex color, including the '#')", message.threadID);
                    colorSuggestionBoolean = message.senderID;
                    colorSuggestionName = input.slice(1).replace(/\s+/g, '');
                    return log.info('RGB error');
                }
            } catch (err) {
                //color not found
                api.sendMessage('I cannot change the chat color to ' + input.slice(1) + ".\n\nWould you like to suggest a color for this?\n(Make sure it's a 6 digit hex color, including the '#')", message.threadID);
                colorSuggestionBoolean = message.senderID;
                colorSuggestionName = input.slice(1).replace(/\s+/g, '');
                return log.info('RGB error');
            }
        }
    }
    api.changeThreadColor(hex, message.threadID, function callback(err) {
        if (err) {
            api.sendMessage('Could not change the chat color to ' + input + '.', message.threadID);
            return console.error(err);
        }
    });
}

function colorSuggestionListener(api, message) {
    if (message.senderID == colorSuggestionBoolean) {
        if (message.body.slice(0, 1) == '#') {
            log.info('got to here');
            if (/^#[0-9A-F]{6}$/i.test(message.body)) {
                f.setData(api, message, v.f.ColorSuggestions.child(message.threadID).child(colorSuggestionName), message.body, 'Suggestion saved; thanks!');
                chatColorChange(api, message, message.body);
                return true;
            } else {
                api.sendMessage("That isn't a valid hex color.", message.threadID);
            }
        }
        colorSuggestionBoolean = 0;
    }
    return false;
}

//RGB COLOR LIBRARY
/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
function RGBColor(color_string) {
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1, 6);
    }

    color_string = color_string.replace(/ /g, '');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input

    if (/[0-9A-F]{6}$/i.test(color_string)) {
        this.ok = true;
    } else if (/([0-9A-F]{3}$)/i.test(color_string)) {
        this.ok = true;
        color_string = color_string.charAt(0) + color_string.charAt(0) + color_string.charAt(1) + color_string.charAt(1) + color_string.charAt(2) + color_string.charAt(2);
    } else {
        var simple_colors = {
            aliceblue: 'f0f8ff',
            antiquewhite: 'faebd7',
            aqua: '00ffff',
            aquamarine: '7fffd4',
            azure: 'f0ffff',
            beige: 'f5f5dc',
            bisque: 'ffe4c4',
            black: '000000',
            blanchedalmond: 'ffebcd',
            blue: '0000ff',
            blueviolet: '8a2be2',
            brown: 'a52a2a',
            burlywood: 'deb887',
            cadetblue: '5f9ea0',
            chartreuse: '7fff00',
            chocolate: 'd2691e',
            coral: 'ff7f50',
            cornflowerblue: '6495ed',
            cornsilk: 'fff8dc',
            crimson: 'dc143c',
            cyan: '00ffff',
            darkblue: '00008b',
            darkcyan: '008b8b',
            darkgoldenrod: 'b8860b',
            darkgray: 'a9a9a9',
            darkgreen: '006400',
            darkkhaki: 'bdb76b',
            darkmagenta: '8b008b',
            darkolivegreen: '556b2f',
            darkorange: 'ff8c00',
            darkorchid: '9932cc',
            darkred: '8b0000',
            darksalmon: 'e9967a',
            darkseagreen: '8fbc8f',
            darkslateblue: '483d8b',
            darkslategray: '2f4f4f',
            darkturquoise: '00ced1',
            darkviolet: '9400d3',
            deeppink: 'ff1493',
            deepskyblue: '00bfff',
            dimgray: '696969',
            dodgerblue: '1e90ff',
            feldspar: 'd19275',
            firebrick: 'b22222',
            floralwhite: 'fffaf0',
            forestgreen: '228b22',
            fuchsia: 'ff00ff',
            gainsboro: 'dcdcdc',
            ghostwhite: 'f8f8ff',
            gold: 'ffd700',
            goldenrod: 'daa520',
            gray: '808080',
            green: '008000',
            greenyellow: 'adff2f',
            honeydew: 'f0fff0',
            hotpink: 'ff69b4',
            indianred: 'cd5c5c',
            indigo: '4b0082',
            ivory: 'fffff0',
            khaki: 'f0e68c',
            lavender: 'e6e6fa',
            lavenderblush: 'fff0f5',
            lawngreen: '7cfc00',
            lemonchiffon: 'fffacd',
            lightblue: 'add8e6',
            lightcoral: 'f08080',
            lightcyan: 'e0ffff',
            lightgoldenrodyellow: 'fafad2',
            lightgrey: 'd3d3d3',
            lightgreen: '90ee90',
            lightpink: 'ffb6c1',
            lightsalmon: 'ffa07a',
            lightseagreen: '20b2aa',
            lightskyblue: '87cefa',
            lightslateblue: '8470ff',
            lightslategray: '778899',
            lightsteelblue: 'b0c4de',
            lightyellow: 'ffffe0',
            lime: '00ff00',
            limegreen: '32cd32',
            linen: 'faf0e6',
            magenta: 'ff00ff',
            maroon: '800000',
            mediumaquamarine: '66cdaa',
            mediumblue: '0000cd',
            mediumorchid: 'ba55d3',
            mediumpurple: '9370d8',
            mediumseagreen: '3cb371',
            mediumslateblue: '7b68ee',
            mediumspringgreen: '00fa9a',
            mediumturquoise: '48d1cc',
            mediumvioletred: 'c71585',
            midnightblue: '191970',
            mintcream: 'f5fffa',
            mistyrose: 'ffe4e1',
            moccasin: 'ffe4b5',
            navajowhite: 'ffdead',
            navy: '000080',
            oldlace: 'fdf5e6',
            olive: '808000',
            olivedrab: '6b8e23',
            orange: 'ffa500',
            orangered: 'ff4500',
            orchid: 'da70d6',
            palegoldenrod: 'eee8aa',
            palegreen: '98fb98',
            paleturquoise: 'afeeee',
            palevioletred: 'd87093',
            papayawhip: 'ffefd5',
            peachpuff: 'ffdab9',
            peru: 'cd853f',
            pink: 'ffc0cb',
            plum: 'dda0dd',
            potato: 'b79268',
            powderblue: 'b0e0e6',
            purple: '800080',
            red: 'ff0000',
            rosybrown: 'bc8f8f',
            royalblue: '4169e1',
            saddlebrown: '8b4513',
            salmon: 'fa8072',
            sandybrown: 'f4a460',
            seagreen: '2e8b57',
            seashell: 'fff5ee',
            sienna: 'a0522d',
            silver: 'c0c0c0',
            skyblue: '87ceeb',
            slateblue: '6a5acd',
            slategray: '708090',
            snow: 'fffafa',
            springgreen: '00ff7f',
            steelblue: '4682b4',
            tan: 'd2b48c',
            teal: '008080',
            thistle: 'd8bfd8',
            tomato: 'ff6347',
            turquoise: '40e0d0',
            violet: 'ee82ee',
            violetred: 'd02090',
            wheat: 'f5deb3',
            white: 'ffffff',
            whitesmoke: 'f5f5f5',
            yellow: 'ffff00',
            yellowgreen: '9acd32'
        };
        for (var key in simple_colors) {
            if (color_string == key) {
                color_string = simple_colors[key];
                this.ok = true;
                break;
            }
        }
    }
    // emd of simple type-in colors

    this.toHex = function() {
        return '#' + color_string;
    }

}


module.exports = {
    chatColorChange: chatColorChange,
    colorSuggestionListener: colorSuggestionListener
}