import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { AccountCommand } from './account-command'
import { Message } from '../../utils/message'

export class List extends AccountCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List accounts which can be used to manage FDS data'

  public async run(): Promise<void> {
    await super.init()
    this.throwIfNoAccounts()

    const accounts = Object.entries(this.commandConfig.config.accounts)
    for (const [accountName, accountData] of accounts) {
      this.console.log(createKeyValue('Name', accountName))
      this.console.log(createKeyValue('Address', accountData.address))
      this.console.divider()
    }

    if (accounts.length === 0) {
      this.console.log(Message.emptyAccountsList())
    }
  }
}
