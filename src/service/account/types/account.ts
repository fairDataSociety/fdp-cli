import { EncryptedSeed, V3Keystore } from './wallet'

export interface Account {
  encryptedWallet: V3Keystore | EncryptedSeed
}
