import { LeafCommand } from 'furious-commander'
import { isV3Wallet } from '../../service/identity'
import { createKeyValue } from '../../utils/text'
import { AccountCommand } from './account-command'

export class List extends AccountCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List wallets which can be used to manage FDP data'

  public async run(): Promise<void> {
    await super.init()
    this.throwIfNoIdentities()

    for (const [identityName, identity] of Object.entries(this.commandConfig.config.identities)) {
      const { encryptedWallet } = identity

      if (!isV3Wallet(encryptedWallet)) {
        throw new Error('Unsupported identity type')
      }

      const address = `0x${encryptedWallet.address}`
      this.console.log(createKeyValue('Name', identityName))
      this.console.log(createKeyValue('Address', address))
      this.console.divider()
    }
  }
}
