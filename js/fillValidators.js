'use strict'
/* global $, fetch */

const API_DELEGATES = 'https://api.testnet.semux.online/v2.2.0/delegates'

async function fillDelegates () {
  const data = await fetch(API_DELEGATES)
  const json = await data.json()
  if (json.success) {
    var html = ''
    const delegates = json.result
    for (let i = 0; i < delegates.length; i++) {
      html += `<option data-address=${delegates[i]['address']}>${delegates[i]['name']} (${formatAddress(delegates[i]['address'])})</option>`
    }
    $('select.delegatesList').html(html)
    $('select.delegatesList.liveSearch').selectpicker()
  }
}

fillDelegates()

function formatAddress (address) {
  // first 6 and last 4 symbols
  const first = address.substring(0, 5)
  const last = address.substring(address.length - 3, address.length)
  const result = first + '...' + last
  return result
}
