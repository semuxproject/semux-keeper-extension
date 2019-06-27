'use strict'
/* global chrome, fetch */

const STEX_API = 'https://api3.stex.com/public/ticker/575'
const BITSTAMP_API = 'https://www.bitstamp.net/api/v2/ticker/btcusd/'

function initStorage () {
  chrome.storage.local.get('accounts', (result) => {
    if (!result.accounts) {
      chrome.storage.local.set({ 'accounts': [] })
      chrome.storage.local.set({ 'password': '' })
      console.log('Init Empty Storage')
    } else {
      console.log(result)
    }
  })
}

async function updateExchangeRates () {
  let stexData, bitstampData
  try {
    stexData = await fetch(STEX_API)
    stexData = await stexData.json()
  } catch (e) {
    return console.error(`Stex API error: ${e.message}`)
  }
  try {
    bitstampData = await fetch(BITSTAMP_API)
    bitstampData = await bitstampData.json()
  } catch (e) {
    return console.error(`Bitstamp API error: ${e.message}`)
  }

  chrome.storage.local.set({
    exchangeRates: {
      btc: parseFloat(stexData.data.last),
      usd: parseFloat(stexData.data.last) * parseFloat(bitstampData.last),
      lastUpdate: Date.now()
    }
  })
}

initStorage()
updateExchangeRates()
