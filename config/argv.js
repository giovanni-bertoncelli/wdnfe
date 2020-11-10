const config = require('./index');
const yargs = require('yargs')
	.string('host')
	.alias('host', 'h')
	.default('host', config.host)
	.describe('host', 'WebDav server host')
	.string('user')
	.alias('user', 'u')
	.default('user', config.user)
	.describe('user', 'WebDav user host')
	.string('password')
	.alias('password', 'p')
	.default('password', config.password)
	.describe('password', 'WebDav password')
	.help();

const {argv} = yargs;
module.exports = argv;