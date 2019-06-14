"use strict";

// By defaults
function initStorage() {
	chrome.storage.local.get('accounts', (result) => {
		if(!result.accounts) {
			chrome.storage.local.set({'accounts': []});
			chrome.storage.local.set({'password': ''});
			console.log("Init Empty Storage")
		} else {
			console.log(result)
		}
	})
}


initStorage()
