'use strict'
/* global $, chrome, fetch */
import { getExchangeRate } from './utils/exchanges.js'
import { getLastActiveAccount, getAllAccounts } from './utils/accounts.js'

const API = 'https://api.testnet.semux.online/v2.2.0/'

/* Reset old txs */
chrome.storage.local.set({ 'txData': {} })

async function getAccountData () {
  let lastActive = await getLastActiveAccount()
  /* If for some reason last active account is not found, set the first one as active */
  if (!lastActive) {
    lastActive = (await getAllAccounts())[0]
  }
  if (!lastActive) {
    return { error: true, code: 'NO_ACCOUNT' }
  } else {
    chrome.storage.local.set({ 'lastActiveAccount': {
      name: lastActive.name,
      address: lastActive.address
    } })
  }
  const response = await fetch(API + 'account?address=' + lastActive.address)
  const addressData = await response.json()
  addressData.address = lastActive.address
  addressData.name = lastActive.name
  return addressData
}

async function fillAccount () {
  const accounts = await getAllAccounts()
  const data = await getAccountData()
  if (!data) {
    console.error('Cannot retrieve account data from the remote Semux node.')
    return
  }
  if (data.error && data.code === 'NO_ACCOUNT') {
    window.location.href = 'welcome.html'
    return
  }

  const price = await getExchangeRate('usd')
  const availableBal = formatAmount(data.result.available)
  const usdAmount = (price * availableBal).toFixed(2)
  const lockedBal = formatAmount(data.result.locked)
  const formedAddress = formatAddress(data.address)

  let accountsHtml = ''
  for (let account of accounts) {
    accountsHtml +=
      `<option value="${account.address}" data-name="${account.name}"` +
      `${account.address === data.address ? 'selected' : ''}>` +
      `${account.name} (${formatAddress(account.address)})</option>`
  }
  $('div.addressData select.activeAddress').append(accountsHtml)
  $('div.addressData p.hexAddress').text(formedAddress)
  $('div.addressData p.hexAddress').attr('data-address', data.address)
  $('p.semValue').text(availableBal.toFixed(4) + ' SEM')
  $('p.usdValue').text(usdAmount + ' USD')
  if (!parseFloat(usdAmount)) {
    $('p.usdValue').hide()
  }
  $('.semLocked').prepend('<span>' + lockedBal.toFixed(3) + ' SEM</span>')
  // getTxs
  if (data.result.transactionCount > 5) {
    const limitFrom = Number(data.result.transactionCount) - 5
    const limitTo = Number(data.result.transactionCount)
    const txsData = await getTxs(data.address, limitFrom, limitTo)
    fillTxs(txsData, data.address)
  } else if (data.result.transactionCount > 0) {
    const txsData = await getTxs(data.address, 0, 5)
    fillTxs(txsData, data.address)
  } else {
    $('.transactionList').append("<p class = 'noTxs gray'>No Transactions</p>")
  }
}

fillAccount()

// get Latest 5 txs
async function getTxs (address, limitFrom, limitTo) {
  const response = await fetch(API + 'account/transactions?address=' + address + '&from=' + limitFrom + '&to=' + limitTo)
  const data = await response.json()
  return data
}

async function fillTxs (data, address) {
  if (!data) return { error: true, reason: 'Node API Drop' }
  let html = ''
  for (let tx of data.result) {
    let value = formatAmount(tx.value)
    const timestamp = tx.timestamp
    let type = tx.to === address ? 'in' : 'out'
    if (tx.from === tx.to) {
      type = 'internal'
    }
    value = type === 'out' ? '-' + value : '+' + value
    html +=
      `<div class='txElement'><div class='transactionItem'><div class='txDataType'>` +
      `<p class='tranasctionType'>${tx.type}</p>` +
      `<p class='transactionDate'>${formatDate(timestamp)}</p>` +
      `</div>` +
      `<div class='transactionAmount tx-${type}'>${value} SEM</div><div class='clearfix'></div></div>` +
      `<div class='transactionExpand' >` +
      `<div class='transactionExpandHeader'><p>Details:</p><p>` +
      `<img  src ='../img/icons/share.png' width='22px' data-hash='${tx.hash}'/></p></div>` +
      `<div class='transactionExpandBody'>` +
      `<div class='tranasctionRow'><p>From: </p><p>${formatAddress(tx.from, 12)}</p></div>` +
      `<div class='tranasctionRow'><p>To: </p><p>${formatAddress(tx.to, 12)}</p></div>` +
      `<div class='tranasctionRow'><p>Amount: </p><p>${tx.value / Math.pow(10, 9)} SEM </p></div>` +
      `<div class='tranasctionRow'><p>Fee: </p><p>${tx.fee / Math.pow(10, 9)} SEM </p></div>` +
      `<div class='tranasctionRow'><p>Total: </p><p>${(tx.value / Math.pow(10, 9) + tx.fee / Math.pow(10, 9))} SEM </p></div>` +
      `</div></div></div>`
  }
  $('.transactionList').append(html)
}

// MOVE TO SEPARATE FILE

function formatDate (string) {
  let newDate = new Date()
  newDate.setTime(string)
  const month = newDate.getMonth() + 1
  const year = newDate.getFullYear()
  const day = newDate.getDay() + 1
  const minutes = newDate.getMinutes()
  const hours = newDate.getHours()
  const mmddyy = month + '/' + day + '/' + year + ' at ' + hours + ':' + minutes
  return mmddyy
}

function formatAddress (address, symbols) {
  // first 6 and last 4 symbols
  if (!symbols) symbols = 6
  const first = address.substring(0, symbols)
  const last = address.substring(address.length - symbols, address.length)
  const result = first + '...' + last
  return result
}

function formatAmount (string) {
  const digit = Number(string) / Math.pow(10, 9)
  return digit
}
