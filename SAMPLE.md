Here is an example of a complete bot js file.
Please note that you will need the [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api), [firebase](https://www.firebase.com/), and this module for this to work.

```javascript
var allanbot = require('allanbot'); //You can name this var whatever you want; just be sure to change all other "allanbot" variables accordingly
var myFirebaseRef = require("firebase");
myFirebaseRef.initializeApp({
  serviceAccount: "[LOCATION OF SERVICE ACCOUNT JSON]",
  databaseURL: "[YOUR FIREBASE URL SHOULD GO HERE]"
});
var login = require('facebook-chat-api');

//This is for the facebook-chat-api
login({
    email: [FACEBOOK EMAIL],
    password: [FACEBOOK PASSWORD]
}, function callback(err, api) {

    if (err) return console.error(err);

    api.setOptions({ //for the facebook-chat-api
        selfListen: true, //necessary for certain functions such as superuser options
        logLevel: 'warn' //the facebook-chat-api and allanbot use a lot of logs at the info level; if you aren't developing, you may want to hide those logs
    });

    allanbot.setOptions({ //for your bot
        api: api, //YOU NEED THIS if you want anything to work
        firebase: myFirebaseRef.database().child('test'), //not necessary for very basic features; but is needed for all firebase functions; this should point to a child node
        botName: 'Testbot', //Caps do matter for display; if you leave this blank, it will take the first name on your facebook account
        myID: 123456789, //ID of your own account (if it is different from that of the bot); no need to input botID (it is now automatic)
        myName: 'Bob',
        devArray: [dev1ID, dev2ID], //These people will have devMode; this and the next two are all arrays
        masterArray: [myID], //Preferably, you'd give yourself full power :); everyone here also has devMode
        ignoreArray: [anotherBotID], //Most likely another bot that has auto responses, or fake accounts; these IDs will be ignored for some functions
        pandoraID: 'PAND0RA 1D' //This is a set of characters that define your pandoraBot; if none is provided, a Mitsuku chatbot will be used
    });

    allanbot.enableFeatures({ //Everything here should be true or false
        everything: true //This will enable everything; check the README for a full list of possible features;
        //Some features are not enabled via "everything": spam
    });

    api.listen(function callback(err, message) { //For the facebook-chat-api

        allanbot.listen(message); //this is what sends all the messages to your bot; it will react according to the settings

        //feel free to add additional code here
    });

});
```
