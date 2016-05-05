var rp = require('request-promise');
var log = require("npmlog");
var v = require('./globalVariables');
var cheerio = require('cheerio');

function listener(api, message, input) {
    if (input.slice(0, 8) != '@mcgill ') return;
    input = input.slice(8);
    courseFinder(api, message, input);
}

function courseFinder(api, message, input) {
    v.continue = false;
    var course = input.match(/[a-zA-Z]+|[0-9]+/g);
    if (course.length != 2) return api.sendMessage(course + ' is an invalid course name', message.threadID);
    rp('http://www.mcgill.ca/study/2016-2017/courses/' + course[0] + '-' + course[1], function(error, response, html) {
        // rp('https://news.ycombinator.com', function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            // if (!$('block-inner').hasClass('p.catalog-instructors')) return api.sendMessage('Content not found', message.threadID);
            $('p.catalog-instructors').each(function(i, element) {
                var instructors = $(this);
                var name = $(this).prev().prev();
                var fulltext = name.text() + '\n' + instructors.text().replace('      Instructors:      ', 'Instructors: ');
                api.sendMessage(fulltext, message.threadID);
            });
            // api.sendMessage('Content not found', message.threadID);
        } else {
            api.sendMessage(course + ' is an invalid course name', message.threadID);
        }
    });
}

module.exports = {
    listener: listener,
    courseFinder: courseFinder
}
