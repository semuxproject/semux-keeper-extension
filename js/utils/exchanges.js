/* global chrome */

/**
 * Returns cached SEM/USD or SEM/BTC exchange rate
 * @param {string} ticker - 'usd' or 'btc'
 */
export function getExchangeRate (ticker = 'usd') {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('exchangeRates', (result) => {
      const rates = result.exchangeRates
      if (rates && rates[ticker]) {
        return resolve(rates[ticker])
      }
      resolve(null)
    })
  })
}
