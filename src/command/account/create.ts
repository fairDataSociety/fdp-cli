import { Wallet } from 'ethers'
import { Argument, LeafCommand, Utils } from 'furious-commander'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { AccountCommand } from './account-command'

export class Create extends AccountCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = "Create Ethereum compatible mnemonic to manage account's data"

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the generated account' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()

    if (Utils.getSourcemap().name === 'default') {
      this.console.info(`No account name specified, defaulting to '${this.accountName}'`)
    }

    if (this.commandConfig.config.accounts[this.accountName]) {
      throw new CommandLineError(Message.accountNameConflictArgument(this.accountName))
    }

    const wallet = Wallet.createRandom()
    const account = await this.createMnemonicAccount(wallet.mnemonic.phrase)
    const saved = this.commandConfig.saveAccount(this.accountName, account)

    if (!saved) {
      throw new CommandLineError(Message.accountNameConflictArgument(this.accountName))
    }

    this.console.log(createKeyValue('Name', this.accountName))
    this.printWallet(wallet)
    this.printWalletQuietly(wallet)
    this.console.info(Message.topUpBalance())
  }
}
