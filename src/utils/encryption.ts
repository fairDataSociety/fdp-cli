import CryptoJS from 'crypto-js'
import { Utils } from '@ethersphere/bee-js'

export const IV_LENGTH = 16

/**
 * Decrypts WordsArray with password
 *
 * @param password string to decrypt bytes
 * @param data WordsArray to be decrypted
 */
export function decrypt(password: string, data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  const wordSize = 4
  const key = CryptoJS.SHA256(password)
  const iv = CryptoJS.lib.WordArray.create(data.words.slice(0, IV_LENGTH), IV_LENGTH)
  const textBytes = CryptoJS.lib.WordArray.create(data.words.slice(IV_LENGTH / wordSize), data.sigBytes - IV_LENGTH)
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: textBytes,
  })

  return CryptoJS.AES.decrypt(cipherParams, key, {
    iv,
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
  })
}

/**
 * Converts bytes to CryptoJS WordArray
 */
export function bytesToWordArray(data: Uint8Array): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(Utils.bytesToHex(data))
}

/**
 * Converts hex string to CryptoJS WordArray
 */
export function hexToWordArray(data: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(data)
}

/**
 * Encrypt bytes with password
 *
 * @param password string for text encryption
 * @param data bytes to be encrypted
 * @param customIv initial vector for AES. In case of absence, a random vector will be created
 */
export function encryptBytes(
  password: string,
  data: CryptoJS.lib.WordArray,
  customIv?: CryptoJS.lib.WordArray,
): Uint8Array {
  return Utils.hexToBytes(CryptoJS.enc.Hex.stringify(encrypt(password, data, customIv)))
}

/**
 * Encrypt WordArray with password
 *
 * @param password string for text encryption
 * @param data WordArray to be encrypted
 * @param customIv initial vector for AES. In case of absence, a random vector will be created
 */
export function encrypt(
  password: string,
  data: CryptoJS.lib.WordArray | string,
  customIv?: CryptoJS.lib.WordArray,
): CryptoJS.lib.WordArray {
  const iv = customIv || CryptoJS.lib.WordArray.random(IV_LENGTH)
  const key = CryptoJS.SHA256(password)

  const cipherParams = CryptoJS.AES.encrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
  })

  return iv.concat(cipherParams.ciphertext)
}

/**
 * Encrypt seed with password
 */
export function encryptSeed(seed: Utils.Bytes<64>, password: string): string {
  return Utils.bytesToHex(encryptBytes(password, bytesToWordArray(seed)))
}

/**
 * Decrypt seed with password
 */
export function decryptSeed(seed: string, password: string): Utils.Bytes<64> {
  return Utils.hexToBytes(CryptoJS.enc.Hex.stringify(decrypt(password, hexToWordArray(seed))))
}
