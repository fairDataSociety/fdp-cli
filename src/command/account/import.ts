import { utils } from 'ethers'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { expectFile } from '../../utils'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { RootCommand } from '../root-command'
import { encryptSeed } from '../../utils/encryption'
import { hdNodeFromSeed, mnemonicToSeed } from '../../utils/wallet'
import { isAccount } from '../../service/account'
import { Seed } from '../../utils/type'
import { Account } from '../../service/account/types'

export class Import extends RootCommand implements LeafCommand {
  public readonly name = 'import'

  public readonly description = 'Import mnemonic or a file with encrypted seed as a new account'

  @Argument({
    key: 'resource',
    required: true,
    description: 'Mnemonic string or path to a file with encrypted seed',
    autocompletePath: true,
  })
  public resource!: string

  @Option({ key: 'name', alias: 'a', description: 'Name of the account to be saved as', required: true })
  public accountName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the account', required: true })
  public password!: string

  public async run(): Promise<void> {
    await super.init()

    if (this.commandConfig.config.accounts[this.accountName]) {
      throw new CommandLineError(Message.accountNameConflict(this.accountName))
    }

    if (utils.isValidMnemonic(this.resource)) {
      this.runSeedImport(mnemonicToSeed(this.resource))
    } else {
      expectFile(this.resource)
      this.resource = JSON.parse(readFileSync(this.resource, 'utf-8'))

      if (!isAccount(this.resource)) {
        throw new CommandLineError(Message.invalidAccount())
      }

      this.runAccountImport(this.resource)
    }
  }

  /**
   * Imports passed account
   */
  private importAccount(account: Account): void {
    if (!this.commandConfig.saveAccount(this.accountName, account)) {
      throw new CommandLineError(Message.accountNameConflictOption(this.accountName))
    }
  }

  /**
   * Runs import of seed as a new account
   */
  private runSeedImport(seed: Seed): void {
    const account = {
      address: hdNodeFromSeed(seed).address,
      encryptedSeed: encryptSeed(seed, this.password),
    }

    this.importAccount(account)
    this.console.log(`Mnemonic imported as account '${this.accountName}' successfully`)
  }

  /**
   * Runs import of an account
   */
  private runAccountImport(account: Account): void {
    this.importAccount(account)

    this.console.log(`Account imported as '${this.accountName}' successfully`)
  }
}
