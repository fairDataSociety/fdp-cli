import crypto from 'crypto'
import { BATCH_ID_HEX_LENGTH, BatchId, BeeDebug, Utils } from '@ethersphere/bee-js'
import fs from 'fs/promises'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { utils } from 'ethers'
import { isUsableBatchExists, ZERO_BATCH_ID } from '../src/utils/bee'
import { decryptAccount, mainHDNodeFromSeed } from '../src/utils/wallet'
import { join } from 'path'
import { Account, isAccount } from '../src/utils/account'

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
 * Returns a batch id for Bee
 */
export function batchId(): BatchId {
  const result = process.env.BEE_BATCH_ID || process.env.CACHED_BEE_BATCH_ID
  assertBatchId(result)

  return result
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
 * Gets usable batch id
 */
export async function getUsableBatch(beeDebug?: BeeDebug): Promise<BatchId> {
  beeDebug = beeDebug ? beeDebug : new BeeDebug(beeDebugUrl())
  const allBatch = await beeDebug.getAllPostageBatch()

  const result = allBatch.find(item => item.usable)

  if (!result) {
    throw new Error('Usable batch not found')
  }

  return result.batchID
}

/**
 * Creates and awaits for a usable batch
 */
export async function createUsableBatch(): Promise<BatchId> {
  const beeDebug = new BeeDebug(beeDebugUrl())

  if (await isUsableBatchExists()) {
    return getUsableBatch(beeDebug)
  }

  await beeDebug.createPostageBatch('10000000', 24)
  for (let i = 0; i < 100; i++) {
    if (await isUsableBatchExists()) {
      break
    }

    await sleep(3000)
  }

  return getUsableBatch(beeDebug)
}

/**
 * Top up specific Ethereum address
 */
export async function topUpAddress(address: string, amountInEther = '1'): Promise<void> {
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

/**
 * Top up wallet of the account
 */
export async function topUpAccount(path: string, name: string, password: string, amountInEther = '1'): Promise<void> {
  const account = await getAccount(path, name)
  const decryptedSeed = decryptAccount(account, password)
  const hdNode = mainHDNodeFromSeed(decryptedSeed)
  const walletAddress = hdNode.address

  if (!walletAddress) {
    throw new Error(`Wallet for "${name}" not found`)
  }

  return topUpAddress(walletAddress, amountInEther)
}

/**
 * Gets account from the file
 */
export async function getAccount(path: string, name: string): Promise<Account> {
  const data = JSON.parse(await fs.readFile(path, 'utf8'))
  const account = data.accounts[name]

  if (!isAccount(account)) {
    throw new Error(`Incorrect account data for "${name}"`)
  }

  return account
}

/**
 * Creates FDP instance
 */
export function createFdp(): FdpStorage {
  return new FdpStorage(beeUrl(), batchId())
}

/**
 * Gets correct test file path
 */
export function getTestFilePath(fileName: string): string {
  return join(__dirname, '..', 'test/test-data', fileName)
}
