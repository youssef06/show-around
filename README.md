Show-Around: a Wit.ai Powered Facebook Messenger Bot 
====================================================
This is a Facebook Messenger Bot that will send you pictures of places you're interested in.


If you follow this short tutorial you'll be able to:
- Setup a Facebook Messenger bot with Node js
- Integrate Wit.ai to your Bot
- Define Wit.ai actions that can then be called from Wit.ai stories

You can try it out [here](http://youssef06.github.io/react-vote/index.html)

I built this simple Bot for learning purposes, if you have any suggestion/fix please feel free to contribute :).

Setup
-----
You can clone this project and use it as a starting point to build your own Bot.
1 - To get started you'll need to create a Facebook App and Page, you can find an up to date How-To guide [here](https://developers.facebook.com/docs/messenger-platform/guides/quick-start) (just follow the App configuration part, no need to write any code yet)
To make your bot work your webhook URL needs to be in https, this is a requirement from facebook, you have many options for hosting your Bot:
- Heroku
- Modulus
- Your own Server, you can install an SSL certificate using Let's encrypt [here's a tutorial for Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-ubuntu-16-04) 
- Locally using ngrock

2 - Sign up on Wit.ai and create an App. 
3 - Clone this repository:
```
git clone https://github.com/youssef06/show-around.git
```
4 - Install dependencies
```
npm install
```

5 - Create parameters.js:
 This is an environment specific file, it contains all necessary API keys and tokens
```
module.exports = {
    //go to https://developers.facebook.com > your App page > go to Products > Messenger> under 'Token Generation' select your App, then just copy the token
    PAGE_ACCESS_TOKEN: '________',
    // the token you entered in step 1 when setting up your webhooks 
    VALIDATION_TOKEN: '_________',
    //Get this from your Facebook App dashboard
    APP_SECRET: '________',
    //From Google Console
    GOOGLE_MAPS_KEY: '________',
    //From the settings page of your Wit.ai App
    WIT_TOKEN: '_________'
};
```

7 - Say hello to your bot!
It should echo back any message you write

Create your Stories
-------------------
We've got our bot setup, but for now all it does is just repeat whatever we say, let's make it smarter using Wit.ai Stories:
As explained on Wit.ai: 
> "You will teach Wit by example, and each example conversation is called a Story"

 So let's create a story:


Now let's teach our bot more variations:
 
 