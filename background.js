"use strict";

const STEX_API = 'https://api3.stex.com/public/ticker/575'
const BITSTAMP_API = 'https://www.bitstamp.net/api/v2/ticker/btcusd/';

async function getSemUsd() {
	var stexData, stexJson, btsData, btsJson;
	try {
		stexData = await fetch(STEX_API);
		stexJson = await stexData.json();
	} catch(e) {
		console.log(e)
		console.log("Stex API error")
	}
	try {
		btsData = await fetch(BITSTAMP_API)
		btsJson = await btsData.json()
	} catch(e) {
		console.log(e)
		console.log("Bitstamp API error")
	}

	const semUsd = stexJson.data.last * btsJson.last;
	console.log(semUsd)
	chrome.storage.local.set({'prices': semUsd}) 
}

// update local price every 30 min
setInterval(getSemUsd, 60000*30)


