const {merge} = require('lodash');
let config = require('../config.js');

if(process.env.NODE_ENV === 'dev') {
	config = merge(config, require('../config.dev'));
}

module.exports = config;
