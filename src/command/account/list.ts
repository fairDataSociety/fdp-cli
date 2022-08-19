import { LeafCommand } from 'furious-commander'
import { isV3Wallet } from '../../service/account'
import { createKeyValue } from '../../utils/text'
import { AccountCommand } from './account-command'
import { Message } from '../../utils/message'

export class List extends AccountCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List accounts which can be used to manage FDP data'

  public async run(): Promise<void> {
    await super.init()
    this.throwIfNoAccounts()

    for (const [accountName, account] of Object.entries(this.commandConfig.config.accounts)) {
      const { encryptedWallet } = account

      if (!isV3Wallet(encryptedWallet)) {
        throw new Error(Message.unsupportedAccountType())
      }

      const address = `0x${encryptedWallet.address}`
      this.console.log(createKeyValue('Name', accountName))
      this.console.log(createKeyValue('Address', address))
      this.console.divider()
    }
  }
}
