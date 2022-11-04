import { createUsableBatch } from './utils'

export default async function testsSetup(): Promise<void> {
  // internal env param for caching batch id
  if (!process.env.CACHED_BEE_BATCH_ID) {
    process.env.CACHED_BEE_BATCH_ID = await createUsableBatch()
  }

  console.log(
    `\nBatch ID will be used: ${process.env.CACHED_BEE_BATCH_ID}. It is stored in 'process.env.CACHED_BEE_BATCH_ID'\n`,
  )
}
