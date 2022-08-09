import crypto from 'crypto'
import { BeeDebug } from '@ethersphere/bee-js'
import fs from 'fs/promises'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { utils } from 'ethers'

export function getRandomString(length = 20): string {
  return crypto.randomBytes(length).toString('hex').substring(0, length)
}

/**
 * Returns an url for testing the Bee public API
 */
export function beeUrl(): string {
  return process.env.BEE_API_URL || 'http://127.0.0.1:1633'
}

/**
 * Returns an url for testing the Bee Debug API
 */
export function beeDebugUrl(): string {
  return process.env.BEE_DEBUG_API_URL || 'http://127.0.0.1:1635'
}

/**
 * Sleeps for passed time in milliseconds
 */
export function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * Checks if usable batch is present
 */
export async function isUsableBatchExists(beeDebug?: BeeDebug): Promise<boolean> {
  beeDebug = beeDebug ? beeDebug : new BeeDebug(beeDebugUrl())
  const allBatch = await beeDebug.getAllPostageBatch()

  return Boolean(allBatch.find(item => item.usable))
}

/**
 * Creates and awaits for a usable batch
 */
export async function createUsableBatch(): Promise<void> {
  if (await isUsableBatchExists()) {
    return
  }

  const beeDebug = new BeeDebug(beeDebugUrl())
  await beeDebug.createPostageBatch('10000000', 24)
  for (let i = 0; i < 100; i++) {
    if (await isUsableBatchExists()) {
      break
    }

    await sleep(3000)
  }
}

/**
 * Top up wallet for account registration
 */
export async function topUpWallet(path: string, name: string, amountInEther = '1'): Promise<void> {
  const data = JSON.parse(await fs.readFile(path, 'utf8'))

  const walletAddress = data.identities[name]?.encryptedWallet?.address

  if (!walletAddress) {
    throw new Error(`Wallet for ${name} no found`)
  }

  const address = '0x' + walletAddress
  const fdp = new FdpStorage(beeUrl(), beeDebugUrl())

  const account = (await fdp.ens.provider.listAccounts())[0]
  await fdp.ens.provider.send('eth_sendTransaction', [
    {
      from: account,
      to: address,
      value: utils.hexlify(utils.parseEther(amountInEther)),
    },
  ])

  await fdp.ens.provider.send('evm_mine', [1])
}
