//dummy data object
let data = {
	'austria': [
		"https://www.google.com/maps/@47.1225825,12.1876013,3a,75y,49.93h,89.8t/data=!3m8!1e1!3m6!1s-eb6VCx-SsfY%2FV21wjYqqrCI%2FAAAAAAAC1Lc%2FbU3PYrKUHRQRYD_1eLWRJ4I2kalpwgzdACLIB!2e4!3e11!6s%2F%2Flh6.googleusercontent.com%2F-eb6VCx-SsfY%2FV21wjYqqrCI%2FAAAAAAAC1Lc%2FbU3PYrKUHRQRYD_1eLWRJ4I2kalpwgzdACLIB%2Fw203-h101-n-k-no%2F!7i8192!8i4096"
	],
	'switzerland': [
		"https://www.google.com/maps/place/Mont+Cervin/@45.97648,7.6585533,3a,75y,59.89h,77.47t/data=!3m8!1e1!3m6!1s-8OrRLlaUwKs%2FV4QOhs7IbHI%2FAAAAAAAAAKE%2FywuxQwcjtyEjYQ6jCWT8fjEiexRqL5JdACLIB!2e4!3e11!6s%2F%2Flh4.googleusercontent.com%2F-8OrRLlaUwKs%2FV4QOhs7IbHI%2FAAAAAAAAAKE%2FywuxQwcjtyEjYQ6jCWT8fjEiexRqL5JdACLIB%2Fw234-h117-n-k-no%2F!7i8704!8i4352!4m5!3m4!1s0x478f3368cbb9ecd9:0x9826458cace55849!8m2!3d45.976574!4d7.6584519!5m1!1e4!6m1!1e1"
	]
};


function getImage(str) {
	var countries = Object.keys(data);

	var found = countries.filter(function (country) {
		//if str contains country name
		return str.toLowerCase().indexOf(country) != -1;
	});

	if(found.length) {
		return data[found[0]];
	}

	return [];
}


module.exports = getImage;