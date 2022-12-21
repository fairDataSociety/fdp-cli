import { BatchId, Bee, BeeDebug } from '@ethersphere/bee-js'

export const ZERO_BATCH_ID = '0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Checks that Bee node is available
 */
export async function isBeeAvailable(beeUrl: string): Promise<boolean> {
  try {
    const bee = new Bee(beeUrl)
    await bee.checkConnection()

    return true
  } catch (e) {
    return false
  }
}

/**
 * Gets usable batch id
 */
export async function getUsableBatch(beeDebugUrl: string): Promise<BatchId> {
  const beeDebug = new BeeDebug(beeDebugUrl)
  const allBatch = await beeDebug.getAllPostageBatch()

  const result = allBatch.find(item => item.usable)

  if (!result) {
    throw new Error('Usable batch not found')
  }

  return result.batchID
}

/**
 * Checks if usable batch is present
 */
export async function isUsableBatchExists(beeDebugUrl: string): Promise<boolean> {
  try {
    return Boolean(await getUsableBatch(beeDebugUrl))
  } catch (e) {
    return false
  }
}
