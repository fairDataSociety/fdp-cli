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
    expect(v3.crypto).toBeDefined()
    expect(v3.crypto.cipher).toBeDefined()
    expect(v3.crypto.cipherparams).toBeDefined()
    expect(v3.crypto.cipherparams.iv).toBeDefined()
    expect(v3.crypto.ciphertext).toBeDefined()
    expect(v3.crypto.kdf).toBeDefined()
    expect(v3.crypto.kdfparams).toBeDefined()
    expect(v3.crypto.kdfparams.salt).toBeDefined()
    expect(v3.crypto.kdfparams.dklen).toBeDefined()
    expect(v3.crypto.mac).toBeDefined()
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
