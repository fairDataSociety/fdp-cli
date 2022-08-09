import { v3ToWallet, walletToV3 } from '../../src/utils/wallet'
import { Wallet } from 'ethers'

describe('Utils', () => {
  it('walletToV3', async () => {
    const wallet = Wallet.createRandom()
    const password = 'helloworld'
    const v3 = await walletToV3(wallet, password)

    expect(v3.id).toBeDefined()
    expect(v3.version).toBeDefined()
    expect(v3.address).toEqual(wallet.address.replace('0x', '').toLowerCase())
    const crypto = v3.Crypto
    expect(crypto).toBeDefined()
    expect(crypto.cipher).toBeDefined()
    expect(crypto.cipherparams).toBeDefined()
    expect(crypto.cipherparams.iv).toBeDefined()
    expect(crypto.ciphertext).toBeDefined()
    expect(crypto.kdf).toBeDefined()
    expect(crypto.kdfparams).toBeDefined()
    expect(crypto.kdfparams.salt).toBeDefined()
    expect(crypto.kdfparams.dklen).toBeDefined()
    expect(crypto.mac).toBeDefined()
    expect(v3['x-ethers']).toBeDefined()
  })

  it('v3ToWallet', async () => {
    const wallet = Wallet.createRandom()
    const password = 'helloworld'
    const v3 = await walletToV3(wallet, password)
    const recoveredWallet = await v3ToWallet(v3, password)

    expect(recoveredWallet.address).toEqual(wallet.address)
    expect(recoveredWallet.privateKey).toEqual(wallet.privateKey)
  })
})
