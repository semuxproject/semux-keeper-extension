'use strict'
/* global $, fetch, chrome */

const API_DELEGATES = 'https://api.testnet.semux.online/v2.2.0/delegates'

async function getDelegates () {
  let data = {}
  try {
    data = await fetch(API_DELEGATES)
    data = await data.json()
  } catch (e) {
    /* TODO: Show error in UI */
    return console.error(e)
  }
  chrome.storage.local.get('txData', (result) => {
    let selectedDelegate
    if (result.txData) {
      selectedDelegate = result.txData.toAddress
    }
    if (data.success) {
      let html = '<option value="">Select Delegate</option>'
      const delegates = data.result
      for (let i = 0; i < delegates.length; i++) {
        html += `<option ${selectedDelegate === delegates[i]['address'] ? 'selected' : ''}` +
        ` data-address="${delegates[i]['address']}" ` +
        `data-subtext="${parseInt(parseFloat(delegates[i]['votes']) / 1e9, 10)} SEM">` +
        `${delegates[i]['name']}</option>`
      }
      $('select.delegatesList').html(html)
      $('select.delegatesList.liveSearch').selectpicker()
    }
  })
}

getDelegates()
