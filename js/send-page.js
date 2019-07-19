'use strict'
/* global $, chrome, fetch */
import { getLastActiveAccount } from './utils/accounts.js'

const API = 'https://api.testnet.semux.online/v2.2.0/'

var userAmount

async function getSender () {
  let activeAccount = await getLastActiveAccount()
  let addressData = {}
  try {
    addressData = await fetch(API + 'account?address=' + activeAccount.address)
    addressData = await addressData.json()
  } catch (e) {
    /* TODO: display error */
    return console.error(e)
  }

  const availableBal = formatAmount(addressData.result.available)
  userAmount = availableBal

  $('p.senderName').text(activeAccount.address)
  $('p.senderAmount').text((availableBal).toFixed(9) + ' SEM')

  chrome.storage.local.get('txData', (result) => {
    if (result.txData) {
      $('input.toAddress').val(result.txData.toAddress)
      $('input.amount').val(result.txData.amount)
    }
  })
}

getSender()

$('input.toAddress').on('change', function (e) {
  const to = $(this).val()
  if (!isAddress(to)) {
    $('button.goToApprovePage').prop('disabled', true)
    $('span.invalidAddress').show()
    $('span.invalidAddress').text('Invalid address')
  } else {
    $('span.invalidAddress').hide()
    $('button.goToApprovePage').prop('disabled', false)
  }
})

$('input.amount').on('change', function (e) {
  let amount = $(this).val().replace(/,/g, '.')
  amount = parseFloat(amount)
  if (!amount || amount > userAmount + 0.005) {
    $('button.goToApprovePage').prop('disabled', true)
    $('span.invalidAmount').show()
    $('span.invalidAmount').text('Invalid amount')
  } else {
    $('span.invalidAmount').hide()
    $('button.goToApprovePage').prop('disabled', false)
  }
})

$('button.goToApprovePage').on('click', function (e) {
  e.preventDefault()
  $('p.error').text('').hide()
  let toAddress = $('input.toAddress').val()
  if (!toAddress) {
    toAddress = $('select.delegatesList option:selected').attr('data-address')
  }
  const amount = $('input.amount').val()
  const type = $('body').data('type')
  if (type === 'TRANSFER') {
    if (!toAddress) {
      return $('p.error').text('Not valid recipient').show()
    }
    if (!amount) {
      return $('p.error').text('The amount should be greater than 0.').show()
    }
  } else if (type === 'VOTE') {
    if (!toAddress) {
      return $('p.error').text('Select delegate').show()
    }
    if (!amount || parseInt(amount, 10) <= 0) {
      return $('p.error').text('The amount should be greater than 0.').show()
    }
  }
  console.log(type)
  chrome.storage.local.get('txData', async (result) => {
    var validatorAddress, fromAddress, privateKeySeleted

    const activeAccount = await getLastActiveAccount()

    // vote tx
    if (!toAddress) {
      validatorAddress = $('select.delegatesList option:selected').attr('data-address')
    }

    const accounts = await getAddressFromStorage()

    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].address === activeAccount.address) {
        fromAddress = accounts[i].address
        privateKeySeleted = accounts[i].privateKey
      }
    }

    chrome.storage.local.set({ 'txData': {
      type: type,
      accountName: activeAccount.name,
      fromAddress,
      privateKeySeleted,
      toAddress: toAddress || validatorAddress,
      amount
    } })
    window.location.href = 'confirm.html'
  })
})

function getAddressFromStorage () {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('accounts', (result) => {
      resolve(result.accounts)
    })
  })
}

function formatAmount (string) {
  return Number(string) / 1e9
}

function isAddress (address) {
  return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address))
}
