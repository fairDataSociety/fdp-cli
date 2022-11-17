import { isObject, isString } from './type'
import { Utils } from '@ethersphere/bee-js'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 255
export const MIN_USERNAME_LENGTH = 4
export const MAX_USERNAME_LENGTH = 82
export const HD_PATH = `m/44'/60'/0'/0/0`

/**
 * Account data
 */
export interface Account {
  address: string
  encryptedSeed: string
}

/**
 * Asserts that account object is correct
 */
export function isAccount(value: unknown): value is Account {
  const data = value as Account
  const walletPrefix = '0x'

  return (
    isObject(data) &&
    isString(data.address) &&
    data.address.indexOf(walletPrefix) === 0 &&
    Utils.isHexEthAddress(data.address.replace(walletPrefix, '')) &&
    Utils.isHexString(data.encryptedSeed)
  )
}
