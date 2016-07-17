# AllanBot-Public

This is a node.js module that contains helper functions used in AllanBot.

The bot uses the unofficial [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api), as well as [firebase](https://www.firebase.com/) among other things.

The bot can be seen [here](https://www.facebook.com/profile.php?id=100004410158491). (type "@allanbot help" to see all the features!)

---------------------------

To use this, either install the module via

`npm install allanbot`

or add the following to your package.json dependency:

`"allanbot": "git://github.com/AllanWang/AllanBot-Public"`

All the bot features may be accessed after the following in your js file:

`var allanbot = require('allanbot');`

For a detailed example, [check here](https://github.com/AllanWang/AllanBot-Public/blob/master/SAMPLE.md).

--------------------------

##Features

-- Copied from the generated help menu as of July 16th, 2016 --

AllanBot is a Facebook Chat Bot that can be called by using "@allanbot [message]"

It also has the following features:

--- Saving text ---  
"@allanbot --save xxx" will save the input xxx with a timestamp. These saved messages are specific to each conversation, and are not related to other messages you save in other messages.   
"@allanbot --saved" will show the saved input.  
"@allanbot --erase" will erase the saved input.  

--- Translate ---  
"@allanbot -t [language] [text]" will translate [text].  
[language] may either be the language you are translating to, or input:output (ie @allanbot-t french:russian bonjour)  
"@allanbot -t" will display all the available languages  

--- Quick notifications ---  
You need to type "@allanbot --eqn" to enable this feature.  
"@allanbot @[name]: [content]" will notify [name] once he/she responds to ensure that the message is viewed.  
"@allanbot --dqn" will disable this feature.  

--- Mention notifications ---  
"@allanbot --notify" will notify you when anyone else from any other thread mentions your name.  
"@allanbot --notify [key]" will do the same, but with [key] as the keyword. You may add multiple keys.  
"@allanbot --notify --clear" will clear all the keys, and  
"@allanbot --notify --keys will show you all your current keys  
"@allanbot --notify ![key]" will blacklist [key] from the search ("@allanbot --notify !bot" will not notify you if a message contains "bot")  

--- Reminders ---  
"@allanbot remind [name] @[time] [content]" will create a reminder for [name] in the future.  
[time] can be formatted by HH:mm (with or without am/pm) or by a full date(YYYY/MM/DD HH:mm)  

--- Quote/Find/Count ---  
"@allanbot --find [text]" will display the latest message containing [text].  
"@allanbot --quote [text]" will do the same thing but will also save it  
You may view the saved quotes via "@allanbot --quotes" or "@allanbot --all quotes" to see the quotes saved by everyone in this conversation.  
"@allanbot --count" will display the number of messages in the conversation  

--- Chat colours ---  
"@allanbot #000000" will change the chat colour to 000000 (black). That colour can be any 6 digit hex colour.  
Common colour names may also be recognized, and you can create your own suggestions.   
"@allanbot #random" will set the colour to a random colour and   
"@allanbot #undo" will change it to the previous colour.  

--- Chat title ---  
"@allanbot title: [title]" will change the conversation title  

--- Chat nicknames ---  
"@allanbot nickname: [nickname]" will change your nickname to [nickname]; leave it blank (nickname: ) to remove your nickname  
* Dev features  
"@allanbot --nonickname" will remove all nicknames and save them to firebase          
"@allanbot --yesnickname" will restore the nicknames if they were saved

--- Using echo ---  
"@allanbot --echo [text]" will have AllanBot repeat that text verbatim.  

--- Direct responses ---  
"@allanbot --me" will get AllanBot to automatically respond to you, without you having to type "@allanbot" in the future (you still need @allanbot for commands). You can type "stop" to disable this afterwards.  

--- McGill Features ---  
"@mcgill [course]" will display some information on that course (ie @mcgill biol200)  
