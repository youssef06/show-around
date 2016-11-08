const config = require('./config');

//dummy data object
let places = [
	'austria',
	'switzerland',
    'italy',
    'spain',
    'england',
    'germany',
    'morocco'
];


function getImage(str, cb) {
	var found = places.filter(function (place) {
		//if str contains place name
		return str.toLowerCase().indexOf(place) != -1;
	});

	if(found.length) {
        return getImageForPlace(found[0], cb);
	}
    cb(null);
}

function getImageForPlace(place, cb) {
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
                    cb(s);
                }
            });
        }
    });
}


module.exports = getImage;