import { BeeDebug } from '@ethersphere/bee-js'

/**
 * Checks if usable batch is present
 */
export async function isUsableBatchExists(beeDebugUrl: string): Promise<boolean> {
  const beeDebug = new BeeDebug(beeDebugUrl)
  const allBatch = await beeDebug.getAllPostageBatch()

  return Boolean(allBatch.find(item => item.usable))
}
