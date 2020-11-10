const {host, user, password} = require('./config/argv');
const {createClient} = require('webdav');
const {terminal: term} = require('terminal-kit') ;
const path = require('path');
const { showProgress, hideProgress } = require('./cli/progress');
const open = require('open');

const FILE_MENU_ITEMS = [
	'💾 Download file',
	'↩️ Back'
];

const UPPER_FOLDER = {
	filename: '../',
	basename: '..',
	type: 'directory'
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
		const {basename} = entry;
    
		if(entry.type === 'directory') {
			return `📁 ${basename}`;
		}
    
		if(/(.*)(\.png)|(\.jpg)|(\.gif)|(\.jpeg)|(\.svg)$/gi.test(basename)) {
			return `🖼   ${basename}`;
		}
    
		if(/(.*)(\.pdf)|(\.doc(x?))|(\.xls(x?))|(\.txt)|(\.ppt(x?))$/gi.test(basename)) {
			return `📊  ${basename}`;
		}
    
		if(/(.*)(\.zip)|(\.7z)|(\.tar)|(\.txt)|(\.iso)$/gi.test(basename)) {
			return `🗄  ${basename}`;
		}
    
		if(/(.*)(\.mp4)|(\.flv)|(\.webm)|(\.mkv)|(\.ogg)|(\.avi)|(\.mpeg)|(\.mpg)|(\.mov)$/gi.test(basename)) {
			return `🎬  ${basename}`;
		}
    
		if(/(.*)(\.json)|(\.ini)|(\.js)|(\.ts)|(\.cs)$/gi.test(basename)) {
			return `⚙︎ ${basename}`;
		}
    
		if(/(.*)(\.url)|(\.geojson)|(\.webloc)$/gi.test(basename)) {
			return `🌍  ${basename}`;
		}
    
		if(/(.*)(\.t3d)$/gi.test(basename)) {
			return `🗿  ${basename}`;
		}
    
		if(/(.*)(\.tmap)$/gi.test(basename)) {
			return `🗺  ${basename}`;
		}
    
		return `📄  ${basename}`;
	}

}

module.exports = WebDavClient;