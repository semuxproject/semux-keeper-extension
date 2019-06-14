"use strict";

const { Network, TransactionType, Transaction, Key } = require('semux-js')
const Long = require('long');
const Buffer = require('buffer/').Buffer

const { decrypt, encrypt, toHexString, hexBytes, randomSalt, randomIv } = require('./utils.js');

const API = "https://api.testnet.semux.online/v2.2.0/";
const faucet = "0xfe81ddefe30d7ab28f2ce73bb37d3d42603c4ddf"
const FEE = 5000000

function createNewAddress() {
	const key = Semux.Key.generateKeyPair()
	const privateKey = toHexString(key.getEncodedPrivateKey())
	const address = '0x' + key.toAddressHexString()
	return {
		address,
		privateKey
	};
}


function createNewWallet(password) {
	// check by address[0]
	const salt = randomSalt()
	const iv = randomIv()
	const key = Semux.Key.generateKeyPair()
	const { encryptedPrivKey }  = encrypt({ salt, iv, password, key })
	
	const newWallet = {
		address: `0x${key.toAddressHexString()}`,
		encrypted: encryptedPrivKey,
		salt, 
		iv
	}

	return newWallet;
}


// new createWallet func
$('button#createWallet').on('click', function(e) {
	e.preventDefault();
	chrome.storage.local.get('accounts', (result) => {
		const accounts = result.accounts;
		const password = $('input.passwordField').val();
		var accountName = $('input#accountName').val();
		if(!accountName) {
			accountName = 'Name ' + String(accounts.length+1);
		}
		const account = createNewWallet(password)
		account.name = accountName
		accounts.push(account)
		chrome.storage.local.set({'accounts': accounts})
		updateAdressesList(accounts);
		window.location.href = 'home.html';
	})
})


// importWallet
$('button#importWallet').on('click', function(e) {
	e.preventDefault();
	chrome.storage.local.get('accounts', (result) => {
		const accounts = result.accounts;
		const importType = $('.selectImportType option:selected').val();

		// Need to remove dublicates
		if(importType === 'privateKey') {
			const privateKey = $('input#accountPrivatKey').val();
			const key = Semux.Key.importEncodedPrivateKey(Buffer.from(privateKey,"hex"));
			console.log(key)
			const address = '0x'+ key.toAddressHexString();
			accounts.push({
				name: 'Name ' + String(accounts.length+1),
				address,
				privateKey
				// salt
				// iv
				// encrypted
			})
			chrome.storage.local.set({'accounts': accounts})
			window.location.href = 'home.html';
		} else {
			// json file
			const file = document.getElementById('file').files[0];
			const reader = new FileReader();
			reader.onload = (function(theFile) {
        return function(e) {   
        	const jsonFile = JSON.parse(e.target.result) 
        	const pass = $('div.importJson input#accountPass').val();
        	const keys = getKey(jsonFile, pass)
        	if(keys.error) return $('span.error').text(keys.reason)
        	const address = '0x' + keys.toAddressHexString();
        	const salt = jsonFile.cipher.salt;
        	const iv = jsonFile.cipher.iv;
        	const encrypted = jsonFile.accounts[0].encrypted;
        	// test wallet pass = lol123
        	accounts.push({
						name: 'Name ' + String(accounts.length+1),
						address,
						salt,
						iv,
						encrypted,
						imported: true
					})
        	chrome.storage.local.set({'accounts': accounts})
					window.location.href = 'home.html';
        };
      })(file);
      try {
      	reader.readAsText(file);
      } catch(e) {
      	return $('span.error').text("Please choose a .json file")
      }
		
		}
	})
})


// 0x7692b8b58ab41900423d3e6384b35ba4ab1f50b5
// 302e020100300506032b6570042204207fb80d72f9f511d874780ca04e8b242e8e3c742f370bb7d9ef7605fd7cc45659

// 

function getKey(walletInfo, pass) {
	const privKey = decrypt({
    salt: walletInfo.cipher.salt,
    iv: walletInfo.cipher.iv,
    password: pass,
    encryptedPrivKey: walletInfo.accounts[0].encrypted
  })	
 
  const privKeyBytes = hexBytes(privKey)

  try {
    return Key.importEncodedPrivateKey(privKeyBytes)
  } catch (err) {
    return { 
    	error: true, 
    	reason: 'Invalid password.'
    }
  }
}

	

// 0x54e2883816e0f42f7f4ebf3fd918bfe9d68bfc32
// 302e020100300506032b657004220420fa210e075725c26221dc998837dfe802d34e5f6a885a15ebb52939bc49caf028



$('button#passwordConfirm').on('click', function(e) {
	const txObj = {};
	const password = $('input.passwordField').val();
	txObj.toAddress = $('div.confirmTo').attr('data-address');
	txObj.type = $('div.confirmType').text()
	var value = $('div.confirmAmount').text();
	// double def ?
	value = value.split(' ')[0];
	if (value.includes(',')) value = value.replace(/,/g, '.')
	var amount = parseFloat(value)
  if (!amount) return $('span.error').text('Amount is not correct.'); 
  txObj.amount = amount * Math.pow(10, 9)

  chrome.storage.local.get('accounts', async (result) => {
  	const accounts = result.accounts;
		const accountAddress = $('div.confirmFrom').attr('data-address');;
		var keys;
		for (let i = 0; i< accounts.length; i++) {
			if(accounts[i].address == accountAddress) {
				txObj.address = accounts[i].address;
				// make it compatible with getKey func
				
				keys = getKey({
					cipher: {
						salt: accounts[i].salt,
						iv: accounts[i].iv
					},
					accounts: [{encrypted: accounts[i].encrypted}]
				}, password);

				if(keys.error) {
					return $('span.error').text(keys.reason)
				}
				txObj.privateKey = keys;
				
				const hash = await sendTx(txObj)

				if(hash) {
					chrome.storage.local.set({'txData': {}});
					window.location.href = 'home.html'
				}
				// update tx list with pending tx
			}
		}
  })
})


// 0xfe81ddefe30d7ab28f2ce73bb37d3d42603c4ddf
// 0xfe81ddefe30d7ab28f2ce73bb37d3d42603c4ddf


async function sendTx(txObj) {
	try {
		var isFrom = await getAddress(txObj.address)
	} catch(e) {
		return {error: true, reason: "Cannot get nonce"}
	}
	
	const nonce = parseInt(isFrom.nonce, 10) + parseInt(isFrom.pendingTransactionCount, 10)

	try {
    var tx = new Transaction(
      Network.TESTNET,
      TransactionType[txObj.type.toUpperCase()],
      hexBytes(txObj.toAddress), // to
      Long.fromNumber(txObj.amount), // value
      Long.fromNumber(FEE), // fee
      Long.fromNumber(nonce), // nonce
      Long.fromNumber(new Date().getTime()), // timestamp
      "" 
      // '0x6d6574616d61736b' // data
    ).sign(txObj.privateKey)
  } catch (e) {
    console.log(e)
  }

  const hash = await sendTxToApi(tx)
  return hash
  
}

async function getAddress (address) {
  const response =  await fetch(API + 'account?address=' + address)
  const { result } = await response.json();
  if (result) return result
  return result;
}


async function sendTxToApi (tx) {
  const serialize = Buffer.from(tx.toBytes().buffer).toString('hex')
  console.log(serialize)

  try {
  	const response = await fetch(API + 'transaction/raw?raw='+serialize+"&validateNonce=true", {
  		method: 'POST',
	    headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
  	});
		var { result } = await response.json();
  } catch(e) {
  	console.log(e)
  }
  if (result) return result
}


function getStorageAccounts() {
	return new Promise((resolve,reject) => {
		chrome.storage.local.get('accounts', (result) => {
			resolve(result.accounts)
		})
	})
}

function updateAdressesList(accountsArray) {
	var html = "";
	for(let i = 0; i < accountsArray.length; i++) {
		html += `<li><div>${accountsArray[i].name}</div></li>`;
		// accountsArray[i].name
		// accountsArray[i].address
	}
	$('div.mainMenu .dropdown-menu ul').html(html);
}





