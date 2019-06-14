"use strict";

// enable all tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

$('.goToHomePage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'home.html';
})


$('li.goToNewAccPage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'newAccount.html#create-tab';
});

$('li.goToImportAccPage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'newAccount.html#import-tab';

});

$('li.goToHardwarePage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'newAccount.html#connect-tab';
});

$('li.goToSemuxScan').on('click', function(e) {
	const address = $('p.hexAddress').attr('data-address');
	chrome.tabs.create({ url: 'https://semux.info/explorer/account/' + address });
})

$('button.goToSemuxScan').on('click', function(e) {
	const address = $('div.hexAddress').attr('data-address');
	chrome.tabs.create({ url: 'https://semux.info/explorer/account/' + address });
})

$('li.goToAccountDetails').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'accountDetails.html';
})

$('div.goToNewAccPage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'newAccount.html';
});



$('button.goToSendPage, div.goToSendPage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'send.html';
})

$('button.goToVotePage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'vote.html';
})

$('button.goToBuyPage').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'buy.html';
})

$('button.goToTokok').on('click', function(e) {
	e.preventDefault();
	chrome.tabs.create({ url: 'https://www.tokok.com/market?symbol=SEM_BTC' });
})

$('button.goToStex').on('click', function(e) {
	e.preventDefault();
	chrome.tabs.create({ url: 'https://app.stex.com/en/basic-trade/pair/BTC/SEM/1D' });
})

// newAccountPage
$('.new-account button.btn-cancel').on('click', function(e) {
	e.preventDefault();
	window.location.href = 'home.html';
})

// cancel any action
$('button.btn-cancel').on('click', function (e) {
	e.preventDefault();
	window.location.href = 'home.html';
})

$('div.sendPage button.btn-cancel, div.confirmPage button.btn-cancel, div.votePage button.btn-cancel').on('click', function(e) {
	// remove txData from "storage"
	e.preventDefault()
	chrome.storage.local.set({'txData': {}});
})



$('div.sendPage .goToHomePage').on('click', function(e) {
	e.preventDefault();
	// remove txData from "storage"
	chrome.storage.local.set({'txData': {}});
	window.location.href = 'home.html';
})


$('div.transactionList').on('click', 'div.transactionItem', function(e) {
	e.preventDefault()

	$(this).parent().find('div.transactionExpand').toggle()
})

// why it doesn't work????
$('p.transactionHeader').on('click', 'img', function(e) {
	e.preventDefault()
	
})

$('select.selectImportType').on('change', function (e) {
	e.preventDefault();
	var type = $('.selectImportType option:selected').val();
	if(type == 'privateKey') {
		// add ledger here
		$('.importKey').show();
		$('.importJson, .connectLedger').hide();
	} else {
		$('.importJson').show();
		$('.importKey, .connectLedger').hide();
	}
})


$('button.exportPrivateKey').on('click', function(e) {
	e.preventDefault()

})

var url = document.location.toString()
if(url.match('#')) {
	const tab = url.split('#')[1];
	$('.nav-tabs a[href="#'+tab+'"]').tab('show');
}
