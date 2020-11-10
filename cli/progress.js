const {terminal: term} = require('terminal-kit');
let spinner;

async function showProgress(description) {
	term.clear();
	printHeader();
	spinner = await term.spinner();
	term.bgGray.yellow(` ${description}`);
}

function hideProgress() {
	spinner.animate(false);
	term.clear();
	printHeader();
	spinner = undefined;
}

function printHeader() {
	term.blue('WDNFE WebDav Nodejs File Explorer\n');
	term.gray('Press q to exit...\n\n');
}

module.exports = {showProgress, hideProgress};