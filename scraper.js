'use strict'

let cheerio = require('cheerio')
	, cheerioAdv = require('cheerio-advanced-selectors')
	, request = require('request-promise-native');

cheerio = cheerioAdv.wrap(cheerio);

module.exports = class Scraper {
	constructor({ authors: songAuthors, name: songName, album: songAlbum, length: songLength }) {
		this.authors = songAuthors;
		this.name = songName;
		this.album = songAlbum;
		this.length = songLength;
		this.query = `${songName}-${songAuthors.join('-')}`.replace(' ', '-');
	}

	search() {
		return request('http://search.chiasenhac.vn/search.php?s=' + this.query)
			.then(htmlString => this.processSearch(htmlString))
			//.then(findLinks)
			//.then(() => this.done = true)
			.catch(err => { console.log(err) });
	}

	processSearch(htmlString) {
		const $ = cheerio.load(htmlString);
		let songDataList = [];

		// Go through ever row
		$('.tbtable:first tbody').find('tr:not(:first-child)').each((i, elem) => {
			songDataList.push(this.processRow($, elem))
		});

		console.log(songDataList);
	}

	getBestMatch(songData) {

	}

	processRow($, elem) {
		let songData = {};

		// Check every cell
		$(elem).find('td div.tenbh').each((i, elem2) => {
			let title = this.getSongTitle($, elem2);
			songData.title = title;
		});

		$(elem).find('td span.gen').each((i, elem2) => {
			let songTime = elem2.children[0].data.split(':');
			songData.time = songTime.reduce((prev, val, i, arr) => {
				if (i == 1) prev = +prev * 60 ** (arr.length - 1);
				return prev += +val * 60 ** (arr.length - i - 1);
			});
		});

		return songData;
	}

	getSongTitle($, elem) {
		let songInfo = {};

		$(elem).find('p').each((i, elem2) => {
			if (i == 0) songInfo.name = elem2.children[0].children[0].data;
			else songInfo.authors = elem2.children[0].data.split('; ');
		});

		return songInfo;
	}
}

/*
module.exports = function({ author: songAuthor, name: songName, album: songAlbum, length: songLength}) {
	let urlSearch = 'http://search.chiasenhac.vn/search.php?s=',
		query = songName.replace(' ', '+');


}
*/