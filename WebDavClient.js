const {host, user, password} = require('./config/argv');
const {createClient} = require('webdav');
const {terminal: term} = require('terminal-kit') ;
const path = require('path');
const { showProgress, hideProgress } = require('./cli/progress');
const open = require('open');

const FILE_MENU_ITEMS = [
	'💾 Download file',
	'↩️  Back'
];

const UPPER_FOLDER = {
	filename: '../',
	basename: '..',
	type: 'directory',
	size: 0
};


class WebDavClient {
	constructor() {
		this.client = createClient(host, {
			username: user,
			password: password
		});
		this.currentPath = '/';
	}
  
	async init() {
		await this.moveTo();
	}
  
	async moveTo(nextPath = './') {
		this.currentPath = path.resolve(this.currentPath, nextPath);
		await showProgress(`Navigating to ${host}${this.currentPath}...`);
		const stats = await this.client.stat(this.currentPath);
		if(stats.type === 'directory') {
			const content = await this.client.getDirectoryContents(this.currentPath);
			return this.showDirList(content);
		} else {
			return this.showFile(stats);
		}
	}
  
	showFile(fileStats) {
		return new Promise((res, rej) => {
			hideProgress();
			term.bgGray.black(`pwd: ${host}${this.currentPath}\n\n`);
			const {filename} = fileStats;
			const downloadLink = this.client.getFileDownloadLink(filename);
			term('ℹ️  File stats:\n');
			term(JSON.stringify(fileStats, null, 4));
			term('\nDownload link: ', downloadLink, '\n\n');
			term.singleLineMenu(FILE_MENU_ITEMS, {
				selectedStyle: term.bgYellow.black
			}, (err, result) => {
				if(err) {
					term('\n')(err);
					term.processExit(1);
				}
				const {selectedIndex} = result;
				let promise = Promise.resolve();
				if(selectedIndex === 0) {
					// download file
					promise = open(downloadLink)
						.then(res)
						.catch(rej);
				} 
				// go back
				return promise
					.then(() => this.moveTo('../')) 
					.then(res)
					.catch(rej);
			});
		});
	}
  
	showDirList(dirContent) {
		return new Promise((res, rej) => {
			hideProgress();
			term.bgGray.black(`📂 ${host}${this.currentPath}\n`);
			// append ../ + ./ folder
			dirContent.unshift(UPPER_FOLDER);
			term('\n').singleColumnMenu(
				dirContent.map(e => this.beautifyEntry(e)),
				(err, result) => {
					if(err) {
						term('\n')(err);
						term.processExit(1);
					}
					const {selectedIndex} = result;
					const chosenEntry = dirContent[selectedIndex];
					this.moveTo(chosenEntry.filename)
						.then(res)
						.catch(rej);
				});
		});
	}
  
	beautifyEntry(entry) {
		let {basename, size, type, lastmod, mime} = entry;
		let result = `📄 ${basename}`;
    
		if(entry.type === 'directory') {
			result = `📁 ${basename}`;
		} else if(/(.*)(\.png)|(\.jpg)|(\.gif)|(\.jpeg)|(\.svg)$/gi.test(basename)) {
			result = `🖼  ${basename}`;
		} else if(/(.*)(\.pdf)|(\.doc(x?))|(\.xls(x?))|(\.txt)|(\.csv)|(\.ppt(x?))$/gi.test(basename)) {
			result = `📊 ${basename}`;
		} else if(/(.*)(\.zip)|(\.7z)|(\.tar)|(\.gz)|(\.iso)$/gi.test(basename)) {
			result = `🗄 ${basename}`;
		} else if(/(.*)(\.mp4)|(\.flv)|(\.webm)|(\.mkv)|(\.ogg)|(\.avi)|(\.mpeg)|(\.mpg)|(\.mov)$/gi.test(basename)) {
			result = `🎬 ${basename}`;
		} else if(/(.*)(\.json)|(\.ini)|(\.js)|(\.ts)|(\.cs)|(\.html)|(\.css)$/gi.test(basename)) {
			result = `⚙︎ ${basename}`;
		} else if(/(.*)(\.url)|(\.geojson)|(\.webloc)$/gi.test(basename)) {
			result = `🌍 ${basename}`;
		} else if(/(.*)(\.t3d)$/gi.test(basename)) {
			result = `🗿 ${basename}`;
		} else if(/(.*)(\.tmap)$/gi.test(basename)) {
			result = `🗺  ${basename}`;
		}
		// basename padend
		if(result.length > 37) {
			result = result.substr(0, 37) + '...';
		}
  
		result = result.padEnd(40, ' ');
		result = result.substr(0, 40);
    
		if(type !== 'directory') {
			result += `${size} B  `.padStart(20, ' ');
		} else {
			result += ''.padStart(20, ' ');
		}
		result = result.substr(0, 60);

		result += `${lastmod || ''}`.padEnd(10, ' ').padStart(30, ' ');
		result = result.substr(0, 100);
    
		if(type !== 'directory') {
			result += `${mime}`.padStart(30, ' ');
		} else {
			result += ''.padStart(30, ' ');
		}
		result = result.substr(0, 130);
    
		return result;
	}

}

module.exports = WebDavClient;