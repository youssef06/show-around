const bodyParser = require('body-parser')
const express = require('express')
const Bot = require('./bot')
const getimage = require('./image-search-mock.js')
const config = require('./config')

let bot = new Bot(config);

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

bot.on('message', (data) => {
    getimage(data.messageText, function (url) {
        if(url) {
            bot.sendImageMessage(data.senderId, url);
        } else {
            bot.sendTextMessage(data.senderId, 'sorry i have nothing to say :|');
        }
    });
});


//var getImage = require('./image-search-mock.js');

//console.log(getImage('can you show me pictures of switzerland?'));
//console.log(getImage('can you show me pictures of italy?'));
