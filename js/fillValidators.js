'use strict'
/* global $, fetch */

const API_DELEGATES = 'https://api.testnet.semux.online/v2.2.0/delegates'

async function getDelegates () {
  const data = await fetch(API_DELEGATES)
  const json = await data.json()
  if (json.success) {
    let html = ''
    const delegates = json.result
    for (let i = 0; i < delegates.length; i++) {
      html += `<option data-address="${delegates[i]['address']}" ` +
      `data-subtext="${parseInt(parseFloat(delegates[i]['votes']) / 1e9, 10)} SEM">` +
      `${delegates[i]['name']}</option>`
    }
    $('select.delegatesList').html(html)
    $('select.delegatesList.liveSearch').selectpicker()
  }
}

getDelegates()
