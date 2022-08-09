import { CommandConfig } from '../../command/root-command/command-config'
import { CommandLog } from '../../command/root-command/command-log'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { Identity, V3Keystore } from './types'
import { v3ToMnemonic } from '../../utils/wallet'

export function isV3Wallet(wallet: V3Keystore): wallet is V3Keystore {
  const data = wallet as V3Keystore

  return data.address.length > 0 && typeof data.Crypto === 'object' && data.id.length > 0 && !isNaN(data.version)
}

export async function getMnemonicFromIdentity(
  console: CommandLog,
  quiet: boolean,
  identity: Identity,
  password?: string,
): Promise<string> {
  const { encryptedWallet } = identity

  if (isV3Wallet(encryptedWallet)) {
    if (!password) {
      if (quiet) {
        throw new CommandLineError('Password must be passed with the --password option in quiet mode')
      }
      password = await console.askForPassword('Please provide the password for this V3 Wallet')
    }

    return v3ToMnemonic(encryptedWallet, password)
  }

  throw new CommandLineError(`Wrong identity type`)
}

export function pickIdentity(commandConfig: CommandConfig, console: CommandLog): Promise<string> {
  const names = Object.keys(commandConfig.config.identities)

  if (!names.length) {
    throw new CommandLineError(Message.noIdentity())
  }

  return console.promptList(names, 'Please select an identity for this action')
}
