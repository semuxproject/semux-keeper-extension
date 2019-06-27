'use strict'

const forge = require('node-forge')
const Buffer = require('buffer/').Buffer

const { createBuffer, hexToBytes } = forge.util
const { createDecipher, createCipher } = forge.cipher
const { random, pkcs5 } = forge

const PBKDF2_ITERATIONS = Math.pow(2, 12)
const AES_KEY_LEN = 24

module.exports = {
  decrypt: (decryptObj) => {
    console.log(decryptObj)
    const saltB = hexToBytes(decryptObj.salt)
    const ivB = hexToBytes(decryptObj.iv)
    const aesKey = pkcs5.pbkdf2(decryptObj.password, saltB, PBKDF2_ITERATIONS, AES_KEY_LEN)
    const decipher = createDecipher('AES-CBC', aesKey)
    decipher.start({ iv: ivB })
    decipher.update(createBuffer(hexToBytes(decryptObj.encryptedPrivKey)))
    decipher.finish()
    return decipher.output.toHex()
  },
  // salt, iv, key, password
  encrypt: (encrybObj) => {
    const saltB = hexToBytes(encrybObj.salt)
    const ivB = hexToBytes(encrybObj.iv)

    const aesKey = pkcs5.pbkdf2(encrybObj.password, saltB, PBKDF2_ITERATIONS, AES_KEY_LEN)
    const cipher = createCipher('AES-CBC', aesKey)
    cipher.start({ iv: ivB })
    cipher.update(createBuffer(encrybObj.key.getEncodedPrivateKey()))
    cipher.finish()
    return {
      salt: encrybObj.salt,
      iv: encrybObj.iv,
      encryptedPrivKey: cipher.output.toHex()
    }
  },
  randomSalt: () => {
    return createBuffer(random.getBytesSync(16)).toHex()
  },

  randomIv: () => {
    return createBuffer(random.getBytesSync(16)).toHex()
  },

  toHexString: (byteArray) => {
    return Array.from(byteArray, function (byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2)
    }).join('')
  },

  hexBytes: (string) => {
    return Buffer.from(string.replace('0x', ''), 'hex')
  },

  formatAmount: (string) => {
    const digit = Number(string) / Math.pow(10, 9)
    return digit
  }
}
