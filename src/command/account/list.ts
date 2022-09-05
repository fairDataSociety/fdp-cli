import { LeafCommand } from 'furious-commander'
import { getAccountType } from '../../service/account'
import { createKeyValue } from '../../utils/text'
import { AccountCommand } from './account-command'

export class List extends AccountCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List accounts which can be used to manage FDS data'

  public async run(): Promise<void> {
    await super.init()
    this.throwIfNoAccounts()

    for (const [accountName, account] of Object.entries(this.commandConfig.config.accounts)) {
      const type = getAccountType(account)
      const address = `0x${account.encryptedWallet.address}`
      this.console.log(createKeyValue('Name', accountName))
      this.console.log(createKeyValue('Address', address))
      this.console.log(createKeyValue('Type', type))
      this.console.divider()
    }
  }
}
