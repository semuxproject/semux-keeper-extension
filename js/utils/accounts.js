/* global chrome */

export function getAllAccounts () {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('accounts', (result) => {
      resolve(result.accounts)
    })
  })
}

export function getLastActiveAccount () {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('lastActiveAccount', (result) => {
      console.log(result)
      resolve(result.lastActiveAccount)
    })
  })
}
