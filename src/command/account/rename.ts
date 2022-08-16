import { Argument, LeafCommand } from 'furious-commander'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { AccountCommand } from './account-command'

export class Rename extends AccountCommand implements LeafCommand {
  public readonly name = 'rename'

  public readonly alias = 'mv'

  public readonly description = 'Rename an existing account'

  @Argument({ key: 'name', description: 'Name of the account to be renamed', required: true })
  public accountName!: string

  @Argument({ key: 'new-name', description: 'New name of the account', required: true })
  public newName!: string

  public async run(): Promise<void> {
    await super.init()
    const account = this.getAccountByName(this.accountName)

    if (!this.commandConfig.saveAccount(this.newName, account)) {
      throw new CommandLineError(Message.accountNameConflict(this.newName))
    }
    this.commandConfig.removeAccount(this.accountName)

    this.console.log(`Account '${this.accountName}' has been renamed to ${this.newName}`)
  }
}
