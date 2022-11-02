import { utils, Wallet } from 'ethers'
import { V3Keystore } from '../service/account/types'
import { Seed } from './type'
import { Utils } from '@ethersphere/bee-js'
import { decryptSeed, encryptSeed } from './encryption'

export const ADDRESS_LENGTH = 40
export const X_SEED_KEY = 'x-seed'

/**
 * Converts and encrypts the given wallet to V3 format
 *
 * @param mnemonic mnemonic phrase
 * @param password password to encrypt the wallet
 */
export async function mnemonicToV3(mnemonic: string, password: string): Promise<V3Keystore> {
  const parsed = JSON.parse(await Wallet.fromMnemonic(mnemonic).encrypt(password))
  const seed = Utils.hexToBytes(utils.mnemonicToSeed(mnemonic).replace('0x', '')) as Seed
  parsed[X_SEED_KEY] = encryptSeed(seed, password)

  return parsed
}

/**
 * Converts and decrypts the given V3 wallet to a mnemonic phrase
 *
 * @param v3 V3 wallet
 * @param password password to decrypt the wallet
 */
export async function v3ToMnemonic(v3: V3Keystore, password: string): Promise<string> {
  const wallet = await v3ToWallet(v3, password)
  const mnemonic = wallet.mnemonic?.phrase

  if (!mnemonic) {
    throw new Error('Received v3 wallet does not contain mnemonic phrase')
  }

  return mnemonic
}

/**
 * Encrypts the given wallet to V3 keystore
 *
 * @param wallet wallet to convert
 * @param password password to encrypt the wallet
 * @param seed seed bytes
 */
export async function walletToV3(wallet: Wallet, password: string, seed?: Seed): Promise<V3Keystore> {
  const parsed = JSON.parse(await wallet.encrypt(password))

  // Saving the seed in encrypted form is necessary to save a portable account.
  // V3 contains a derivative wallet from seed.
  // Seed cannot be get back from it, but it is needed for fdp-storage to work.
  if (seed) {
    parsed[X_SEED_KEY] = encryptSeed(seed, password)
  }

  return parsed
}

/**
 * Decrypts the given V3 wallet to the wallet
 *
 * @param v3 V3 wallet
 * @param password password to decrypt the wallet
 */
export async function v3ToWallet(v3: V3Keystore, password: string): Promise<Wallet> {
  return Wallet.fromEncryptedJson(JSON.stringify(v3), password)
}

/**
 * Decrypts V3 to seed
 *
 * @param v3 encrypted V3
 * @param password password to decrypt V3
 */
export function v3ToSeed(v3: V3Keystore, password: string): Seed {
  const encryptedSeed = v3[X_SEED_KEY]

  if (!encryptedSeed) {
    throw new Error(`V3 wallet does not contain "${X_SEED_KEY}" property`)
  }

  return decryptSeed(encryptedSeed, password)
}
