import { Argument, LeafCommand } from 'furious-commander'
import { CommandLineError } from '../../utils/error'
import { AccountCommand } from './account-command'
import { Message } from '../../utils/message'
import { isAccount } from '../../utils/account'
import { setMainAccount } from '../../utils/config'

export class Main extends AccountCommand implements LeafCommand {
  public readonly name = 'main'

  public readonly description = 'Set or show main account'

  @Argument({ key: 'name', description: 'The name of the main account to be set' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()

    if (!this.accountName) {
      const mainAccount = this.commandConfig.config.mainAccount

      if (mainAccount) {
        this.console.log(Message.mainAccount(this.commandConfig.config.mainAccount))
      } else {
        this.console.log(Message.mainAccountEmpty())
      }

      return
    }

    const account = this.commandConfig.config.accounts[this.accountName]

    if (!account) {
      throw new CommandLineError(Message.noSuchAccount(this.accountName))
    }

    if (!isAccount(account)) {
      throw new CommandLineError(Message.unsupportedAccountType())
    }

    setMainAccount(this.accountName, this.commandConfig.configFilePath, this.commandConfig.config)
    this.console.log(Message.newMainAccount(this.accountName))
  }
}
