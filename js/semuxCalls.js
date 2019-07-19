'use strict'
/* globals $, chrome, fetch, Semux, FileReader */

const { Network, TransactionType, Transaction, Key } = require('semux-js')
const Long = require('long')
const Buffer = require('buffer/').Buffer

const { decrypt, encrypt, hexBytes, randomSalt, randomIv } = require('./utils.js')

const API = 'https://api.testnet.semux.online/v2.2.0/'
const FEE = 5000000

function createEncryptedWallet (privateKey, password) {
  // check by address[0]
  const salt = randomSalt()
  const iv = randomIv()
  var key
  if (privateKey) {
    key = privateKey
  } else {
    key = Semux.Key.generateKeyPair()
  }
  const { encryptedPrivKey } = encrypt({ salt, iv, password, key })

  const newWallet = {
    address: `0x${key.toAddressHexString()}`,
    encrypted: encryptedPrivKey,
    salt,
    iv
  }

  return newWallet
}

// new createWallet func
$('button#createWallet').on('click', function (e) {
  e.preventDefault()
  chrome.storage.local.get('accounts', (result) => {
    const accounts = result.accounts
    const password = $('input.passwordField').val()
    if (!password) return $('span.error').text('Password is required')
    var accountName = $('input#accountName').val()
    if (!accountName) {
      accountName = `Account ${accounts.length + 1}`
    }
    const account = createEncryptedWallet(null, password)
    account.name = accountName
    accounts.push(account)
    chrome.storage.local.set({ 'accounts': accounts })
    updateAdressesList(accounts)
    window.location.href = 'home.html'
  })
})

// importWallet
$('button#importWallet').on('click', function (e) {
  e.preventDefault()
  chrome.storage.local.get('accounts', (result) => {
    const accounts = result.accounts
    const importType = $('.selectImportType option:selected').val()
    const password = $('div.importKey input#accountPass').val()
    if (!password) return $('span.error').text('Password is required')
    // privateKey
    if (importType === 'privateKey') {
      var key
      let privateKey = $('input#accountPrivatKey').val().replace(/^0x/, '')
      try {
        key = Semux.Key.importEncodedPrivateKey(Buffer.from(privateKey, 'hex'))
      } catch (e) {
        return $('span.error').text('Invalid Private Key')
      }
      const address = '0x' + key.toAddressHexString()
      const exists = accounts.filter(account => account.address === address.toLowerCase())
      if (exists.length !== 0) return $('span.error').text('This account already imported, try another one.')
      const encryptedData = createEncryptedWallet(key, password)
      accounts.push({
        name: `Account ${accounts.length + 1}`,
        address,
        encrypted: encryptedData.encrypted,
        salt: encryptedData.salt,
        iv: encryptedData.iv
      })
      chrome.storage.local.set({ 'accounts': accounts })
      window.location.href = 'home.html'
    } else {
      // json file
      const file = document.getElementById('file').files[0]
      const reader = new FileReader()
      reader.onload = (function (theFile) {
        return function (e) {
          const jsonFile = JSON.parse(e.target.result)
          const pass = $('div.importJson input#accountPass').val()
          const keys = getKey(jsonFile, pass)
          if (keys.error) return $('span.error').text(keys.reason)
          const address = '0x' + keys.toAddressHexString()
          const exists = accounts.filter(account => account.address === address.toLowerCase())
          if (exists.length !== 0) return $('span.error').text('This account already imported, try another one.')
          const salt = jsonFile.cipher.salt
          const iv = jsonFile.cipher.iv
          const encrypted = jsonFile.accounts[0].encrypted

          accounts.push({
            name: `Account ${accounts.length + 1}`,
            address,
            salt,
            iv,
            encrypted,
            imported: true
          })
          chrome.storage.local.set({ 'accounts': accounts })
          window.location.href = 'home.html'
        }
      })(file)
      try {
        reader.readAsText(file)
      } catch (e) {
        return $('span.error').text('Please choose a .json file')
      }
    }
  })
})

function getKey (walletInfo, pass) {
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
      reason: 'Password incorrect.'
    }
  }
}

$('button#passwordConfirm').on('click', function (e) {
  const txObj = {}
  const password = $('input.passwordField').val()
  txObj.toAddress = $('div.confirmTo').attr('data-address')
  txObj.type = $('div.confirmType').text()
  var value = $('div.confirmAmount').text()
  // double def ?
  value = value.split(' ')[0]
  if (value.includes(',')) value = value.replace(/,/g, '.')
  var amount = parseFloat(value)
  if (!amount) return $('span.error').text('Amount is not correct.')
  txObj.amount = amount * Math.pow(10, 9)

  chrome.storage.local.get('accounts', async (result) => {
    const accounts = result.accounts
    const accountAddress = $('div.confirmFrom').attr('data-address')
    var keys
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].address === accountAddress) {
        txObj.address = accounts[i].address
        // make it compatible with getKey func
        keys = getKey({
          cipher: {
            salt: accounts[i].salt,
            iv: accounts[i].iv
          },
          accounts: [{ encrypted: accounts[i].encrypted }]
        }, password)
        if (keys.error) {
          return $('span.error').text(keys.reason)
        }
        txObj.privateKey = keys

        const hash = await sendTx(txObj)

        if (hash) {
          chrome.storage.local.set({ 'txData': {} })
          window.location.href = 'home.html'
        }
        // update tx list with pending tx
      }
    }
  })
})

async function sendTx (txObj) {
  try {
    var isFrom = await getAddress(txObj.address)
  } catch (e) {
    return { error: true, reason: 'Cannot get nonce' }
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
      ''
      // '0x6d6574616d61736b' // data
    ).sign(txObj.privateKey)
  } catch (e) {
    console.log(e)
  }

  const hash = await sendTxToApi(tx)
  return hash
}

async function getAddress (address) {
  const response = await fetch(API + 'account?address=' + address)
  const { result } = await response.json()
  if (result) return result
  return result
}

async function sendTxToApi (tx) {
  const serialize = Buffer.from(tx.toBytes().buffer).toString('hex')
  try {
    const response = await fetch(API + 'transaction/raw?raw=' + serialize + '&validateNonce=true', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    var { result } = await response.json()
  } catch (e) {
    console.log(e.message)
  }
  if (result) return result
}

function updateAdressesList (accountsArray) {
  var html = ''
  for (let i = 0; i < accountsArray.length; i++) {
    html += `<li><div>${accountsArray[i].name}</div></li>`
    // accountsArray[i].name
    // accountsArray[i].address
  }
  $('div.mainMenu .dropdown-menu ul').html(html)
}
