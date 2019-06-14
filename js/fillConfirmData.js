"use strict";


function fillConfirmData() {
	chrome.storage.local.get('txData',async  (result) => {
		if(result.txData) {
			const txData = result.txData;
			$('div.confirmFrom').text(formatAddress(txData.fromAddress))
			$('div.confirmTo').text(formatAddress(txData.toAddress))
			$('div.confirmFrom').attr('data-address', txData.fromAddress)
			$('div.confirmTo').attr('data-address', txData.toAddress)
			$('div.confirmAmount').text(txData.amount + " SEM")
			$('div.confirmType').text(txData.type)
			const price = await getUsdPrice();
			if (txData.amount.includes(',')) txData.amount = txData.amount.replace(/,/g, '.')
			const usdAmount = price * txData.amount

			$('div.confirmTotal').text("~"+usdAmount.toFixed(4) + " USD")
		}
		
	})
}

function getUsdPrice() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('prices', (result) => {
			if(result.prices) {
				resolve(result.prices)
			}
		})
	})
}

function formatAddress(string) {
	const formatString = string.substring(0, 10) + "..." + string.substring(string.length-10, string.length)
	return formatString;
} 

fillConfirmData();