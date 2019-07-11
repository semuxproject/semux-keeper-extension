'use strict'
/* global $, chrome, QRCode */
import { getLastActiveAccount, getAllAccounts } from './utils/accounts.js'

async function fillAccDetailsData () {
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
  $('div.hexAddress span').text(lastActive.address)
  $('div.hexAddress span').attr('data-address', lastActive.address)
  var qrcode = new QRCode('qrcode', {
    width: 180,
    height: 180,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  })
  qrcode.makeCode(lastActive.address)
}

fillAccDetailsData()
