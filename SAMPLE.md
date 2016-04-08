Here is an example of a complete bot js file.
Please note that you will need both the [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) and [firebase](https://www.firebase.com/) dependencies for this to work.

```javascript
var allanbot = require('allanbot'); //You can name this whatever you want; just be sure to change all other "allanbot" variables accordingly
var Firebase = require("firebase");
var myFirebaseRef = new Firebase([YOUR FIREBASE URL SHOULD GO HERE];
var login = require('facebook-chat-api');


//This is an example of email authentication; you don't need this if you don't have email security
myFirebaseRef.authWithPassword({
    email: [VALID EMAIL],
    password: [VALID PASSWORD]
}, function(error, authData) {
    if (error) {
        console.log("Login Failed!", error);
    } else {
        console.log("Authenticated successfully with payload");
    }
});

//This is for the facebook-chat-api
login({
    email: [FACEBOOK EMAIL],
    password: [FACEBOOK PASSWORD]
}, function callback(err, api) {

    if (err) return console.error(err);

    api.setOptions({ //for the facebook-chat-api
        selfListen: true, //necessary for certain functions such as superuser options
        logLevel: 'info'
    });

    allanbot.setOptions({ //for your bot
        api: api, //YOU NEED THIS if you want anything to work
        firebase: myFirebaseRef.child('test'), //not necessary for very basic features; but is needed for all firebase functions; this should point to a child node
        botName: 'Testbot', //Caps do matter for display
        botID: 987654321,
        myID: 123456789, //ID of your own account (if it is different from that of the bot)
        myName: 'Bob',
        devArray: [dev1ID, dev2ID], //These people will have devMode; this and the next two are all arrays
        masterArray: [myID], //Preferably, you'd give yourself full power :)
        ignoreArray: [anotherBotID], //Most likely another bot that has auto responses, or fake accounts; these IDs will be ignored for some functions
        pandoraID: 'PANDORA ID' //This is a set of characters that define your pandoraBot; if none is provided, a Mitsuku chatbot will be used
    });

    allanbot.enableFeatures({ //Everything here should be true or false
        everything: true //This will enable everything; check the README for a full list of possible features;
    });

    api.listen(function callback(err, message) { //For the facebook-chat-api

        allanbot.listen(message); //this is what sends all the messages to your bot; it will react according to the settings

        //feel free to add additional code here
    });

});
```
