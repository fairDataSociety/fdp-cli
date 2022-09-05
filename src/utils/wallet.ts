import { Wallet } from 'ethers'
import { V3Keystore } from '../service/account/types'

export const ADDRESS_LENGTH = 40

/**
 * Converts and encrypts the given wallet to V3 format
 *
 * @param mnemonic mnemonic phrase
 * @param password password to encrypt the wallet
 */
export async function mnemonicToV3(mnemonic: string, password: string): Promise<V3Keystore> {
  return JSON.parse(await Wallet.fromMnemonic(mnemonic).encrypt(password))
}

/**
 * Converts and decrypts the given V3 wallet to a mnemonic phrase
 *
 * @param v3 V3 wallet
 * @param password password to decrypt the wallet
 */
export async function v3ToMnemonic(v3: V3Keystore, password: string): Promise<string> {
  return (await v3ToWallet(v3, password)).mnemonic.phrase
}

/**
 * Converts and encrypt the given wallet to V3 wallet
 *
 * @param wallet wallet to convert
 * @param password password to encrypt the wallet
 */
export async function walletToV3(wallet: Wallet, password: string): Promise<V3Keystore> {
  return JSON.parse(await wallet.encrypt(password))
}

/**
 * Converts and decrypts the given V3 wallet to a wallet
 *
 * @param v3 V3 wallet
 * @param password password to decrypt the wallet
 */
export async function v3ToWallet(v3: V3Keystore, password: string): Promise<Wallet> {
  return Wallet.fromEncryptedJson(JSON.stringify(v3), password)
}
