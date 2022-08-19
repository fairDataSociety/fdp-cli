import { utils } from 'ethers'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { expectFile } from '../../utils'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { RootCommand } from '../root-command'
import { mnemonicToV3 } from '../../utils/wallet'

export class Import extends RootCommand implements LeafCommand {
  public readonly name = 'import'

  public readonly description = 'Import mnemonic or a file with mnemonic as a new account'

  @Argument({
    key: 'resource',
    required: true,
    description: 'Mnemonic string or path to a file with mnemonic',
    autocompletePath: true,
  })
  public resource!: string

  @Option({ key: 'name', alias: 'a', description: 'Name of the account to be saved as', required: true })
  public accountName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the V3 wallet', required: true })
  public password!: string

  public async run(): Promise<void> {
    await super.init()

    if (this.commandConfig.config.accounts[this.accountName]) {
      throw new CommandLineError(Message.accountNameConflict(this.accountName))
    }

    if (utils.isValidMnemonic(this.resource)) {
      await this.runMnemonicImport()
    } else {
      expectFile(this.resource)
      this.resource = readFileSync(this.resource, 'utf-8')

      if (!utils.isValidMnemonic(this.resource)) {
        throw new CommandLineError(Message.invalidMnemonic())
      }

      await this.runMnemonicImport()
    }
  }

  /**
   * Runs import of mnemonic as a new account
   */
  private async runMnemonicImport(): Promise<void> {
    const data = {
      encryptedWallet: await mnemonicToV3(this.resource, this.password),
    }

    if (!this.commandConfig.saveAccount(this.accountName, data)) {
      throw new CommandLineError(Message.accountNameConflictOption(this.accountName))
    }

    this.console.log(`Mnemonic imported as account '${this.accountName}' successfully`)
  }
}
