import { Wallet } from 'ethers'
import { V3Keystore } from '../service/identity/types'

export async function assertV3ConvertsToMnemonic(v3: V3Keystore, password: string): Promise<void> {
  const mnemonic = (await v3ToWallet(v3, password)).mnemonic?.phrase

  if (!mnemonic) {
    throw new Error('V3 wallet does not convert to mnemonic')
  }
}

export async function mnemonicToV3(mnemonic: string, password: string): Promise<V3Keystore> {
  return JSON.parse(await Wallet.fromMnemonic(mnemonic).encrypt(password))
}

export async function v3ToMnemonic(v3: V3Keystore, password: string): Promise<string> {
  return (await v3ToWallet(v3, password)).mnemonic.phrase
}

export async function walletToV3(wallet: Wallet, password: string): Promise<V3Keystore> {
  return JSON.parse(await wallet.encrypt(password))
}

export function v3ToWallet(v3: V3Keystore, password: string): Promise<Wallet> {
  return Wallet.fromEncryptedJson(JSON.stringify(v3), password)
}
