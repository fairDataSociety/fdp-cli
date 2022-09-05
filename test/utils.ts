import crypto from 'crypto'
import { BATCH_ID_HEX_LENGTH, BatchId, BeeDebug, Utils } from '@ethersphere/bee-js'
import fs from 'fs/promises'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { utils } from 'ethers'
import { isUsableBatchExists, ZERO_BATCH_ID } from '../src/utils/bee'

/**
 * Asserts whether batch id passed
 */
export function assertBatchId(value: unknown, name = 'batchId'): asserts value is BatchId {
  if (!Utils.isHexString(value, BATCH_ID_HEX_LENGTH)) {
    throw new Error(`Incorrect hex string: ${name}`)
  }
}

/**
 * Generates a random hex string with the passed length
 *
 * @param length length of output string
 */
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
export async function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
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

    await sleep(10000)
  }
}

/**
 * Top up wallet for account registration
 */
export async function topUpWallet(path: string, name: string, amountInEther = '1'): Promise<void> {
  const data = JSON.parse(await fs.readFile(path, 'utf8'))

  const walletAddress = data.accounts[name]?.encryptedWallet?.address

  if (!walletAddress) {
    throw new Error(`Wallet for ${name} no found`)
  }

  const address = '0x' + walletAddress
  assertBatchId(ZERO_BATCH_ID)
  const fdp = new FdpStorage(beeUrl(), ZERO_BATCH_ID)
  const account = (await fdp.ens.provider.listAccounts())[0]
  const txHash = await fdp.ens.provider.send('eth_sendTransaction', [
    {
      from: account,
      to: address,
      value: utils.hexlify(utils.parseEther(amountInEther)),
    },
  ])

  await fdp.ens.provider.waitForTransaction(txHash)
}
