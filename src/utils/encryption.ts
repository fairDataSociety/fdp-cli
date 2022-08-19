import CryptoJS from 'crypto-js'
import { Utils } from '@ethersphere/bee-js'

export const IV_LENGTH = 16

/**
 * Converts bytes to CryptoJS WordArray
 */
export function bytesToWordArray(data: Uint8Array): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Hex.parse(Utils.bytesToHex(data))
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
export function encryptSeed(seed: Uint8Array, password: string): string {
  const encryptedBytes = encryptBytes(password, bytesToWordArray(seed))

  return Utils.bytesToHex(encryptedBytes)
}
