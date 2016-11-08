/**
 * Created by youssef on 06/11/16.
 */
const bodyParser = require('body-parser')
const crypto = require('crypto')
const express = require('express')
const https = require('https')
const request = require('request')
const util = require('util')
const EventEmitter = require('events').EventEmitter
const extend = require('xtend')

const defaults = {
    PAGE_ACCESS_TOKEN: null,
    VALIDATION_TOKEN: null,
    APP_SECRET: null
}

class Bot extends EventEmitter {
    constructor(options) {
        super();
        options = extend(defaults, options);
        for(let k in options) {
            if(options.hasOwnProperty(k) && !options[k]) {
                throw new Error(`Missing parameter ${k}`);
            }
        }
        this.options = options;
    }

    verifyBotMiddleware() {
        return (req, res) => {
            if (req.query['hub.mode'] === 'subscribe' &&
                req.query['hub.verify_token'] === this.options.VALIDATION_TOKEN) {
                console.log("Validating webhook");
                res.status(200).send(req.query['hub.challenge']);
            } else {
                console.error("Failed validation. Make sure the validation tokens match.");
                res.sendStatus(403);
            }
        };
    }

    mainMiddleware() {
        return (req, res) => {
            var data = req.body;

            // Make sure this is a page subscription
            if (data.object == 'page') {
                // Iterate over each entry
                // There may be multiple if batched
                data.entry.forEach((pageEntry) => {
                    // Iterate over each messaging event
                    pageEntry.messaging.forEach((messagingEvent) => {
                        if (messagingEvent.message) {
                            this.receivedMessage(messagingEvent);
                        } else if (messagingEvent.delivery) {
                            //receivedDeliveryConfirmation(messagingEvent);
                        } else if (messagingEvent.postback) {
                            //receivedPostback(messagingEvent);
                        } else if (messagingEvent.read) {
                            //receivedMessageRead(messagingEvent);
                        } else {
                            console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                        }
                    });
                });

                // Assume all went well.
                //
                // You must send back a 200, within 20 seconds, to let us know you've
                // successfully received the callback. Otherwise, the request will time out.
                res.sendStatus(200);
            }
        }
    }

    /*
     * Verify that the callback came from Facebook. Using the App Secret from
     * the App Dashboard, we can verify the signature that is sent with each
     * callback in the x-hub-signature field, located in the header.
     *
     * https://developers.facebook.com/docs/graph-api/webhooks#setup
     *
     */
    verifyRequestMiddleware() {
        return (req, res, buf) => {
            var signature = req.headers["x-hub-signature"];

            if (!signature) {
                // For testing, let's log an error. In production, you should throw an
                // error.
                console.error("Couldn't validate the signature.");
            } else {
                var elements = signature.split('=');
                var method = elements[0];
                var signatureHash = elements[1];

                var expectedHash = crypto.createHmac('sha1', this.options.APP_SECRET)
                    .update(buf)
                    .digest('hex');

                if (signatureHash != expectedHash) {
                    throw new Error("Couldn't validate the request signature.");
                }
            }
        };
    }

    /*
     * Message Event
     *
     * This event is called when a message is sent to your page. The 'message'
     * object format can vary depending on the kind of message that was received.
     * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
     *
     * For this example, we're going to echo any text that we get. If we get some
     * special keywords ('button', 'generic', 'receipt'), then we'll send back
     * examples of those bubbles to illustrate the special message bubbles we've
     * created. If we receive a message with an attachment (image, video, audio),
     * then we'll simply confirm that we've received the attachment.
     *
     */
    receivedMessage(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;

        console.log("Received message for user %d and page %d at %d with message:",
            senderID, recipientID, timeOfMessage);
        console.log(JSON.stringify(message));

        var isEcho = message.is_echo;
        var messageId = message.mid;
        var appId = message.app_id;
        var metadata = message.metadata;

        // You may get a text or attachment but not both
        var messageText = message.text;
        var messageAttachments = message.attachments;
        var quickReply = message.quick_reply;

        if (isEcho) {
            // Just logging message echoes to console
            console.log("Received echo for message %s and app %d with metadata %s",
                messageId, appId, metadata);
            return;
        } else if (quickReply) {
            var quickReplyPayload = quickReply.payload;
            console.log("Quick reply for message %s with payload %s",
                messageId, quickReplyPayload);

            this.sendTextMessage(senderID, "Quick reply tapped");
            return;
        }

        if (messageText) {
            this.emit('message', {senderId: senderID, messageText: messageText});
        }
    }

    /*
     * Send an image using the Send API.
     *
     */
    sendImageMessage(recipientId, url) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        url: url
                    }
                }
            }
        };

        this.callSendAPI(messageData);
    }

    /*
     * Send a text message using the Send API.
     *
     */
    sendTextMessage(recipientId, messageText) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText,
                metadata: "DEVELOPER_DEFINED_METADATA"
            }
        };

        this.callSendAPI(messageData);
    }


    /*
     * Send a Structured Message (Generic Message type) using the Send API.
     *
     */
    sendGenericMessage(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: "rift",
                            subtitle: "Next-generation virtual reality",
                            item_url: "https://www.oculus.com/en-us/rift/",
                            image_url: "http://cappuccino.ma/wp-content/uploads/2016/07/Tanger_cappuccino.jpg",
                            buttons: [{
                                type: "web_url",
                                url: "https://www.oculus.com/en-us/rift/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Call Postback",
                                payload: "Payload for first bubble",
                            }],
                        }, {
                            title: "touch",
                            subtitle: "Your Hands, Now in VR",
                            item_url: "https://www.oculus.com/en-us/touch/",
                            image_url: "http://cappuccino.ma/wp-content/uploads/2016/07/Tanger_cappuccino.jpg",
                            buttons: [{
                                type: "web_url",
                                url: "https://www.oculus.com/en-us/touch/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Call Postback",
                                payload: "Payload for second bubble",
                            }]
                        }]
                    }
                }
            }
        };

        this.callSendAPI(messageData);
    }

    /*
     * Call the Send API. The message data goes in the body. If successful, we'll
     * get the message id in a response
     *
     */
    callSendAPI(messageData) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: this.options.PAGE_ACCESS_TOKEN},
            method: 'POST',
            json: messageData

        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

                if (messageId) {
                    console.log("Successfully sent message with id %s to recipient %s",
                        messageId, recipientId);
                } else {
                    console.log("Successfully called Send API for recipient %s",
                        recipientId);
                }
            } else {
                console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
            }
        });
    }
}


/*
/!*
 * Turn typing indicator on
 *
 *!/
function sendTypingOn(recipientId) {
    console.log("Turning typing indicator on");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_on"
    };

    callSendAPI(messageData);
}

/!*
 * Turn typing indicator off
 *
 *!/
function sendTypingOff(recipientId) {
    console.log("Turning typing indicator off");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_off"
    };

    callSendAPI(messageData);
}
*/

module.exports = Bot;