import { utils } from 'ethers'
import { Seed } from './type'
import { Utils } from '@ethersphere/bee-js'
import { HD_PATH } from './account'

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
  const hdNode = hdNodeFromSeed(seed)
  const signingKey = new utils.SigningKey(hdNode.privateKey)

  return signingKey.publicKey
}

/**
 * Creates HDNode from seed
 */
export function hdNodeFromSeed(seed: Seed): utils.HDNode {
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
  const hdNode = hdNodeFromSeed(seed)

  return {
    seed: getSeedString(seed),
    publicKey: uncompressedPublicKeyFromSeed(seed),
    privateKey: hdNode.privateKey,
    address: hdNode.address,
  }
}
