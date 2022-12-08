import { utils } from 'ethers'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { expectFile } from '../../utils'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { encryptSeed, mainHDNodeFromSeed, mnemonicToSeed } from '../../utils/wallet'
import { Seed } from '../../utils/type'
import { Account, isAccount } from '../../utils/account'
import { AccountCommand } from './account-command'

export class Import extends AccountCommand implements LeafCommand {
  public readonly name = 'import'

  public readonly description = 'Import mnemonic or a file with encrypted seed as a new account'

  @Argument({
    key: 'resource',
    required: true,
    description: 'Mnemonic string or path to a file with encrypted seed',
    autocompletePath: true,
  })
  public resource!: string

  @Option({ key: 'name', default: 'main', description: 'Reference name of the imported account' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()

    this.accountNameCreationCheck(this.accountName, Message.accountNameConflictOption)

    if (utils.isValidMnemonic(this.resource)) {
      await this.runSeedImport(mnemonicToSeed(this.resource))
    } else {
      expectFile(this.resource)
      this.resource = JSON.parse(readFileSync(this.resource, 'utf-8'))

      if (!isAccount(this.resource)) {
        throw new CommandLineError(Message.invalidAccount())
      }

      this.runAccountImport(this.resource)
    }

    this.initializeDefaultAccount(this.accountName)
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
  private async runSeedImport(seed: Seed): Promise<void> {
    await this.askPassword()
    const account = {
      address: mainHDNodeFromSeed(seed).address,
      encryptedSeed: encryptSeed(seed, this.password),
      mainPod: '',
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
