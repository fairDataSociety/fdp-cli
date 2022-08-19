interface ScryptKDFParamsOut {
  dklen: number
  n: number
  p: number
  r: number
  salt: string
}

interface PBKDFParamsOut {
  c: number
  dklen: number
  prf: string
  salt: string
}
declare type KDFParamsOut = ScryptKDFParamsOut | PBKDFParamsOut

/**
 * Encrypted wallet with mnemonic phrase
 */
export interface V3Keystore {
  Crypto: {
    cipher: string
    cipherparams: {
      iv: string
    }
    ciphertext: string
    kdf: string
    kdfparams: KDFParamsOut
    mac: string
  }
  id: string
  version: number
  address: string
  'x-ethers': {
    client: string
    gethFilename: string
    mnemonicCounter: string
    mnemonicCiphertext: string
    path: string
    locale: string
    version: string
  }
}

/**
 * Seed from logged in account encrypted with a password
 */
export interface EncryptedSeed {
  address: string
  encryptedSeed: string
}
