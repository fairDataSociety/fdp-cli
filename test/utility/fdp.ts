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
 * Interface for `createFdpAndImport` method parameters
 */
export interface CreateFdpParams {
  // force set created account as main account
  forceSetAsMain: boolean
}

/**
 * Creates fdp-storage instance and import it to fdp-cli
 */
export async function createFdpAndImport(params?: CreateFdpParams): Promise<ImportedFdp> {
  const fdp = createFdp()
  const account = getRandomString()
  const accountPassword = getRandomString()
  const wallet = fdp.account.createWallet()

  await invokeTestCli(['account', 'import', wallet.mnemonic.phrase, '--name', account, '--password', accountPassword])

  if (params?.forceSetAsMain) {
    await invokeTestCli(['account', 'main', account])
  }

  return {
    fdp,
    account,
    accountPassword,
    wallet,
  }
}
