const {terminal: term} = require('terminal-kit') ;

const WebDAVClient = require('./webdav/WebDAVClient');

term.on('key', function(name) {
	if (name === 'CTRL_C' || name === 'q') { 
		terminate();
	}
});

async function runAsync() {
	const client = new WebDAVClient();
	await client.init();
}

function terminate() {
	term.clear();
	term('\n')('Terminating...');
	term.processExit(0);
}

runAsync();