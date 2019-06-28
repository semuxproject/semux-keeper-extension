'use strict'
/* global $, chrome */

async function fillAccDetailsData () {
  const addresses = await getAddressFromStorage()

  const latest = addresses.length - 1
  const address = addresses[latest].address
  const name = addresses[latest].name

  // var qrcode = new QRCode('qrcode', {
  //   text: address,
  //   width: 180,
  //   height: 180,
  //   colorDark: '#000000',
  //   colorLight: '#ffffff',
  //   correctLevel: QRCode.CorrectLevel.H
  // })
  $('p.accountName').text(name)
  $('div.hexAddress span').text(address)
  $('div.hexAddress span').attr('data-address', address)
}

fillAccDetailsData()

function getAddressFromStorage () {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('accounts', (result) => {
      resolve(result.accounts)
    })
  })
}
