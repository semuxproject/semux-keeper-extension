"use strict";

const API_VALIDOTS = 'https://api.testnet.semux.online/v2.2.0/validators';

async function fillValidators() {
	const data = await fetch(API_VALIDOTS);
	const json = await data.json();
	if(json.success) {
		var html = "";
		const validators = json.result;
		for(let i = 0; i < validators.length; i++) {
			html += `<option data-address=${validators[i]}>${formatAddress(validators[i])}</option>`
		}
		$('select.validatorsList').html(html)
	}
}

fillValidators();

function formatAddress(address) {
	// first 6 and last 4 symbols
	const first = address.substring(0,9);
	const last = address.substring(address.length - 9, address.length)
	const result = first + '...' + last;
	return result;
}
