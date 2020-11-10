const {host, user, password} = require('./config/argv');
const {terminal: term} = require('terminal-kit') ;

const WebDavClient = require('./WebDavClient');
const { showProgress: showProgressAsync } = require('./cli/progress');

term.on('key', function(name) {
	if (name === 'CTRL_C' || name === 'q') { 
		terminate();
	}
});

async function runAsync() {
	const client = new WebDavClient();
	await client.init();
}

function terminate() {
	term.clear();
	term('\n')('Terminating...');
	term.processExit(0);
}

runAsync();