import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { AccountCommand } from './account-command'

export class List extends AccountCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List accounts which can be used to manage FDS data'

  public async run(): Promise<void> {
    await super.init()
    this.throwIfNoAccounts()

    for (const [accountName, accountData] of Object.entries(this.commandConfig.config.accounts)) {
      this.console.log(createKeyValue('Name', accountName))
      this.console.log(createKeyValue('Address', accountData.address))
      this.console.divider()
    }
  }
}
