import { invokeTestCli } from './index'
import { createFdp, getRandomString } from '../utils'
import { Wallet } from 'ethers'
import { FdpStorage } from '@fairdatasociety/fdp-storage'

/**
 * Imported information for fdp
 */
export interface ImportedFdp {
  fdp: FdpStorage
  account: string
  accountPassword: string
  wallet: Wallet
}

/**
 * Creates fdp-storage instance and import it to fdp-cli
 */
export async function createFdpAndImport(): Promise<ImportedFdp> {
  const account = getRandomString()
  const accountPassword = getRandomString()
  const fdp = createFdp()
  const wallet = fdp.account.createWallet()

  await invokeTestCli(['account', 'import', wallet.mnemonic.phrase, '--name', account, '--password', accountPassword])

  return {
    fdp,
    account,
    accountPassword,
    wallet,
  }
}
