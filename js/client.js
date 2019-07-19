'use strict'
/* global $, chrome */

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

$('.goToHomePage').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'home.html'
})

$('select.activeAddress').on('change', function (e) {
  e.preventDefault()
  chrome.storage.local.set({ 'lastActiveAccount': {
    name: $(this).data('name'),
    address: $(this).val()
  } })
  window.location.href = 'home.html'
})

$('li.goToNewAccPage').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'newAccount.html#create-tab'
})

$('li.goToImportAccPage').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'newAccount.html#import-tab'
})

$('li.goToHardwarePage').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'newAccount.html#connect-tab'
})

$('a.copyAddress').on('click', function (e) {
  const address = $('.activeAddress').val()
  navigator.clipboard.writeText(address)
})

$('a.openExplorer').on('click', function (e) {
  const address = $('.activeAddress').val()
  chrome.tabs.create({ url: 'https://testnet.semux.info/explorer/account/' + address })
})

$('a.showQR').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'accountDetails.html'
})

$('div.goToNewAccPage, button.goToNewAccPage').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'newAccount.html'
})

$('a.goToSendPage, div.goToSendPage').on('click', function (e) {
  e.preventDefault()
  const txType = $('.confirmType').text()
  if (txType && txType === 'VOTE') {
    window.location.href = 'vote.html'
  } else {
    window.location.href = 'send.html'
  }
})

$('a.goToVotePage').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'vote.html'
})

$('a.goToBuyPage').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'buy.html'
})

$('button.goToTokok').on('click', function (e) {
  e.preventDefault()
  chrome.tabs.create({ url: 'https://www.tokok.com/market?symbol=SEM_BTC' })
})

$('button.goToStex').on('click', function (e) {
  e.preventDefault()
  chrome.tabs.create({ url: 'https://app.stex.com/en/basic-trade/pair/BTC/SEM/1D' })
})

$('.btn-cancel').on('click', function (e) {
  e.preventDefault()
  window.location.href = 'home.html'
})

$('div.transactionList').on('click', 'div.transactionItem', function (e) {
  e.preventDefault()

  $(this).parent().find('div.transactionExpand').toggle()
})

$('select.selectImportType').on('change', function (e) {
  e.preventDefault()
  var type = $('.selectImportType option:selected').val()
  if (type === 'privateKey') {
    // add ledger here
    $('.importKey').show()
    $('.importJson, .connectLedger').hide()
  } else {
    $('.importJson').show()
    $('.importKey, .connectLedger').hide()
  }
})

$('button.exportPrivateKey').on('click', function (e) {
  e.preventDefault()
})

var url = document.location.toString()
if (url.match('#')) {
  const tab = url.split('#')[1]
  $('.nav-tabs a[href="#' + tab + '"]').tab('show')
}
