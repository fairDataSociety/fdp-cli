import { BatchId, BeeDebug } from '@ethersphere/bee-js'
import { beeDebugUrl } from '../../test/utils'

export const ZERO_BATCH_ID = '0000000000000000000000000000000000000000000000000000000000000000'

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
 * Checks if usable batch is present
 */
export async function isUsableBatchExists(beeDebug?: BeeDebug): Promise<boolean> {
  try {
    return Boolean(await getUsableBatch(beeDebug))
  } catch (e) {
    return false
  }
}
