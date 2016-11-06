/**
 * Created by youssef on 06/11/16.
 */
var parameters = require('./parameters');

var config = {
    port: 8080
};

for (var key in parameters) {
    if(parameters.hasOwnProperty(key)) {
        config[key] = parameters[key];
    }
}

module.exports = config;