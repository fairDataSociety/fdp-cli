import { CommandConfig } from '../../command/root-command/command-config'
import { CommandLog } from '../../command/root-command/command-log'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { Account, V3Keystore } from './types'
import { ADDRESS_LENGTH, v3ToMnemonic } from '../../utils/wallet'

/**
 * Available account types
 *
 * Types are used to request a specific wallet type from an array of wallets
 */
export enum AccountType {
  v3Keystore = 'v3Keystore',
  all = 'all',
}

/**
 * Gets account type by data
 */
export function getAccountType(account: Account): AccountType {
  const { encryptedWallet } = account

  if (isV3Wallet(encryptedWallet)) {
    return AccountType.v3Keystore
  } else {
    throw new Error(Message.unsupportedAccountType())
  }
}

/**
 * Checks if expected type is correct
 */
export function isCorrectType(type: AccountType, account: Account): boolean {
  const { encryptedWallet } = account
  switch (type) {
    case AccountType.v3Keystore:
      return isV3Wallet(encryptedWallet)
    case AccountType.all:
      return true
    default:
      return false
  }
}

/**
 * Validates that the given wallet is a valid V3 wallet
 */
export function isV3Wallet(wallet: unknown): wallet is V3Keystore {
  const data = wallet as V3Keystore

  return (
    Boolean(data) &&
    data.address?.length === ADDRESS_LENGTH &&
    typeof data.Crypto === 'object' &&
    data.id?.length > 0 &&
    !isNaN(data.version)
  )
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
export async function pickAccount(
  commandConfig: CommandConfig,
  console: CommandLog,
  accountType: AccountType,
): Promise<string> {
  const names = Object.entries(commandConfig.config.accounts)
    .filter(nameValue => {
      return isCorrectType(accountType, nameValue[1])
    })
    .map(item => item[0])

  if (!names.length) {
    throw new CommandLineError(Message.noAccount())
  }

  return console.promptList(names, 'Please select an account for this action')
}
