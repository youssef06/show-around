const bodyParser = require('body-parser')
const express = require('express')
const Wit = require('node-wit').Wit
const log = require('node-wit').log
const Bot = require('./bot')
const getimage = require('./image-search-mock.js')
const config = require('./config')

let bot = new Bot(config);

// Our bot actions
const actions = {
    /**
     * This is used by the "Bot sends" action in Wit
     * @param sessionId
     * @param text
     * @param quickreplies
     * @returns {Promise.<T>}
     */
    send({sessionId}, {text, quickreplies}) {
        // Our bot has something to say!
        // Let's retrieve the Facebook user whom this session belongs to
        const recipientId = sessions[sessionId].fbid;
        if (recipientId) {
            console.log('Wit: send action : ' + text);
            console.log(arguments);
            // Yay, we found our recipient!
            // Let's forward our bot response to him.
            // We return a promise to let our bot know when we're done sending
            return bot.sendTextMessage(recipientId, text)
                .catch((err) => {
                    console.error(
                        'Oops! An error occurred while forwarding the response to',
                        recipientId,
                        ':',
                        err.stack || err
                    );
                });
        } else {
            console.error('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            return Promise.resolve();
        }
    },
    /**
     * Merge action
     * @param sessionId
     * @param context
     * @param text
     * @param entities
     * @returns {Promise.<*>}
     */
    merge({sessionId, context, text, entities}) {
        console.log('Wit: merge action : ');
        console.log(arguments);
        //remove previously stored location
        //delete context.location;
        // Retrive the location entity and store it in the context field
        var loc = firstEntityValue(entities, 'location')
        if (loc) {
            context.location = loc
            context.missingLocation = false;
        } else {
            context.missingLocation = true;
        }

        return Promise.resolve(context)
    },
    /**
     * Get-Image action, used to search for a photo of the given context.location and send the photo to the user
     * @param sessionId
     * @param context
     * @param text
     * @param entities
     * @returns {*}
     */
    ['get-image']({sessionId, context, text, entities}) {
        console.log('Wit: get-image action : ');
        console.log(arguments);
        if(!context.location) {
            return Promise.resolve();
        }
        const recipientId = sessions[sessionId].fbid;
        return getimage(context.location)
            .then(function (url) {
                if(url) {
                    context.url = url;

                    return bot.sendImageMessage(recipientId, url);
                }
                return;
            })
            .then(() => {
              return context;
            });
    }
};

// Setting up our bot
const wit = new Wit({
    accessToken: config.WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
});

var app = express();
app.set('port', config.port);
app.use(bodyParser.json({verify: bot.verifyRequestMiddleware()}));

app.get('/', function (req, res) {
    res.status(200).send('Hello world');
});
/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
app.get('/webhook', bot.verifyBotMiddleware());


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', bot.mainMiddleware());

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

//each time we receive a user's message
bot.on('message', (data) => {

    // We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    const sessionId = findOrCreateSession(data.senderId);

    // Let's forward the message to the Wit.ai Bot Engine
    // This will run all actions until our bot has nothing left to do
    wit.runActions(
        sessionId, // the user's current session
        data.messageText, // the user's message
        sessions[sessionId].context // the user's current session state
    ).then((context) => {
        //context has been potentially modified by one of our wit actions
        // Our bot did everything it has to do.
        // Now it's waiting for further messages to proceed.
        console.log('Waiting for next user messages');
        console.log('Reinitializing session');
        delete sessions[sessionId];
        // Updating the user's current session state
        //sessions[sessionId].context = context;
    }).catch((err) => {
        console.error('Oops! Got an error from Wit: ', err.stack || err);
    });
});

// ----------------------------------------------------------------------------
// Wit.ai bot specific functions

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

/**
 * Find or create session for user
 * @param fbid
 * @returns {*}
 */
const findOrCreateSession = (fbid) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {fbid: fbid, context: {}};
    }
    return sessionId;
};

/**
 * Get Entity value from list
 * @param entities
 * @param entity
 * @returns {*}
 */
var firstEntityValue = function (entities, entity) {
    var val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value

    if (!val) {
        return null
    }
    return typeof val === 'object' ? val.value : val
}