import { Wallet } from 'ethers'
import { V3Keystore } from '../service/identity/types'

export async function walletToV3(wallet: Wallet, password: string): Promise<V3Keystore> {
  const v3 = JSON.parse(await wallet.encrypt(password))
  v3.crypto = v3.Crypto
  delete v3.Crypto
  delete v3['x-ethers']

  return v3
}

export async function v3ToWallet(v3: V3Keystore, password: string): Promise<Wallet> {
  return await Wallet.fromEncryptedJson(JSON.stringify(v3), password)
}
