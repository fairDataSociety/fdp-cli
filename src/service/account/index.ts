import { CommandConfig } from '../../command/root-command/command-config'
import { CommandLog } from '../../command/root-command/command-log'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { Account, V3Keystore } from './types'
import { v3ToMnemonic } from '../../utils/wallet'

/**
 * Validates that the given wallet is a valid V3 wallet
 */
export function isV3Wallet(wallet: V3Keystore): wallet is V3Keystore {
  const data = wallet as V3Keystore

  return data.address.length > 0 && typeof data.Crypto === 'object' && data.id.length > 0 && !isNaN(data.version)
}

/**
 * Gets a mnemonic phrase from an account
 */
export async function getMnemonicFromAccount(
  console: CommandLog,
  quiet: boolean,
  account: Account,
  password?: string,
): Promise<string> {
  const { encryptedWallet } = account

  if (!isV3Wallet(encryptedWallet)) {
    throw new CommandLineError('Wrong account type')
  }

  if (!password) {
    if (quiet) {
      throw new CommandLineError('Password must be passed with the --password option in quiet mode')
    }

    password = await console.askForPassword('Please provide the password for this V3 Wallet')
  }

  return v3ToMnemonic(encryptedWallet, password)
}

/**
 * Picks an account from the config
 */
export async function pickAccount(commandConfig: CommandConfig, console: CommandLog): Promise<string> {
  const names = Object.keys(commandConfig.config.accounts)

  if (!names.length) {
    throw new CommandLineError(Message.noAccount())
  }

  return console.promptList(names, 'Please select an account for this action')
}
