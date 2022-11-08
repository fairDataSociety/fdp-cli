import { utils } from 'ethers'
import { Seed } from './type'
import { Utils } from '@ethersphere/bee-js'
import { HD_PATH } from './account'
import CryptoJS from 'crypto-js'
import { bytesToWordArray, decrypt, encryptBytes, hexToWordArray } from './encryption'

/**
 * Prepared data extract from seed to print
 */
export interface PrintSeedData {
  seed: string
  publicKey: string
  privateKey: string
  address: string
}

/**
 * Converts mnemonic phrase to seed bytes
 */
export function mnemonicToSeed(mnemonic: string): Seed {
  const seedString = utils.mnemonicToSeed(mnemonic).replace('0x', '')

  return Utils.hexToBytes(seedString)
}

/**
 * Extract uncompressed public key from seed
 */
export function uncompressedPublicKeyFromSeed(seed: Seed): string {
  const hdNode = mainHDNodeFromSeed(seed)
  const signingKey = new utils.SigningKey(hdNode.privateKey)

  return signingKey.publicKey
}

/**
 * Creates main HDNode account from seed
 */
export function mainHDNodeFromSeed(seed: Seed): utils.HDNode {
  return utils.HDNode.fromSeed(seed).derivePath(HD_PATH)
}

/**
 * Converts seed bytes to hex with 0x
 */
export function getSeedString(seed: Seed): string {
  return `0x${Utils.bytesToHex(seed)}`
}

/**
 * Gets prepared data for printing extracted from seed
 */
export function getPrintDataFromSeed(seed: Seed): PrintSeedData {
  const hdNode = mainHDNodeFromSeed(seed)

  return {
    seed: getSeedString(seed),
    publicKey: uncompressedPublicKeyFromSeed(seed),
    privateKey: hdNode.privateKey,
    address: hdNode.address,
  }
}

/**
 * Encrypt seed with password and convert it to a string
 */
export function encryptSeed(seed: Seed, password: string): string {
  return Utils.bytesToHex(encryptBytes(password, bytesToWordArray(seed)))
}

/**
 * Decrypt seed string with password
 */
export function decryptSeedString(seed: string, password: string): Seed {
  return Utils.hexToBytes(CryptoJS.enc.Hex.stringify(decrypt(password, hexToWordArray(seed))))
}
