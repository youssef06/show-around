const config = require('./config');

function getImageForPlace(place) {
    return new Promise((resolve, reject) => {
        var googleMapsClient = require('@google/maps').createClient({
            key: config.GOOGLE_MAPS_KEY
        });

        googleMapsClient.places({
            query: place
        }, function(err, response) {
            if (!err) {
                //console.log(response.json.results[0].photos[0]);

                googleMapsClient.placesPhoto({
                    photoreference: response.json.results[0].photos[0].photo_reference,
                    maxwidth: 400
                }, function(err, response) {
                    if (!err) {
                        var s = 'https://' + response.socket.parser.socket._host + response.socket.parser.socket._httpMessage.path;
                        resolve(s);
                    } else {
                        reject();
                    }
                });
            } else {
                reject();
            }
        });
    });
}


module.exports = getImageForPlace;