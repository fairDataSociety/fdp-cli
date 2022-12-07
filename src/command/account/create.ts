import { Wallet } from 'ethers'
import { Argument, LeafCommand } from 'furious-commander'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { AccountCommand } from './account-command'
import { mnemonicToSeed } from '../../utils/wallet'

export class Create extends AccountCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create HD Wallet of the Personal Storage'

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the generated account' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()

    this.validateDefaultAccountName(this.accountName)
    const wallet = Wallet.createRandom()
    const seed = mnemonicToSeed(wallet.mnemonic.phrase)
    const account = await this.createAccount(seed)
    const saved = this.commandConfig.saveAccount(this.accountName, account)

    if (!saved) {
      throw new CommandLineError(Message.accountNameConflictArgument(this.accountName))
    }

    this.console.log(createKeyValue('Name', this.accountName))
    this.printSeed(seed)
    this.printSeedQuietly(seed)
    this.console.info(Message.topUpBalance())
    this.saveDefaultAccount(this.accountName)
  }
}
