import { utils, Wallet } from 'ethers'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { V3Keystore } from '../../service/identity/types'
import { expectFile, getFieldOrNull } from '../../utils'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createAndRunSpinner } from '../../utils/spinner'
import { RootCommand } from '../root-command'
import { assertV3ConvertsToMnemonic, mnemonicToV3, walletToV3 } from '../../utils/wallet'
import { isV3Wallet } from '../../service/identity'

export class Import extends RootCommand implements LeafCommand {
  public readonly name = 'import'

  public readonly description = 'Import mnemonic or V3 wallet as a new identity'

  @Argument({
    key: 'resource',
    required: true,
    description: 'Mnemonic string or path to file with V3 Wallet',
    autocompletePath: true,
  })
  public resource!: string

  @Option({ key: 'name', alias: 'i', description: 'Name of the identity to be saved as', required: true })
  public identityName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the V3 wallet', required: true })
  public password!: string

  public async run(): Promise<void> {
    await super.init()

    if (this.commandConfig.config.identities[this.identityName]) {
      throw new CommandLineError(Message.identityNameConflict(this.identityName))
    }

    if (utils.isValidMnemonic(this.resource)) {
      await this.runImportOnMnemonic()
    } else {
      expectFile(this.resource)
      this.resource = readFileSync(this.resource, 'utf-8')

      if (utils.isValidMnemonic(this.resource)) {
        await this.runImportOnMnemonic()
      } else {
        if (!this.password) {
          this.console.log(Message.optionNotDefined('password'))
          this.password = await this.console.askForPassword(Message.existingV3Password())
        }
        const spinner = createAndRunSpinner('Decrypting V3 wallet...', this.verbosity)
        try {
          const wallet: Wallet = await this.decryptV3Wallet(this.resource)

          spinner.text = 'Importing V3 wallet...'
          await this.saveWallet(wallet)
        } finally {
          spinner.stop()
        }
        this.console.log(`V3 Wallet imported as identity '${this.identityName}' successfully`)
      }
    }
  }

  private async runImportOnMnemonic(): Promise<void> {
    const data = {
      encryptedWallet: await mnemonicToV3(this.resource, this.password),
    }

    if (!this.commandConfig.saveIdentity(this.identityName, data)) {
      throw new CommandLineError(Message.identityNameConflictOption(this.identityName))
    }

    this.console.log(`Mnemonic imported as identity '${this.identityName}' successfully`)
  }

  private async decryptV3Wallet(data: string): Promise<Wallet> {
    const v3 = JSON.parse(data) as V3Keystore

    if (!isV3Wallet(v3)) {
      throw new CommandLineError(Message.invalidV3Wallet())
    }

    try {
      await assertV3ConvertsToMnemonic(v3, this.password)

      return Wallet.fromEncryptedJson(data, this.password)
    } catch (error: unknown) {
      const message: string = getFieldOrNull(error, 'message') || 'unknown error'
      throw new CommandLineError(`Failed to decrypt wallet: ${message}`)
    }
  }

  private async saveWallet(wallet: Wallet): Promise<void> {
    const data = {
      encryptedWallet: await walletToV3(wallet, this.password),
    }

    if (!this.commandConfig.saveIdentity(this.identityName, data)) {
      throw new CommandLineError(Message.identityNameConflict(this.identityName))
    }
  }
}
