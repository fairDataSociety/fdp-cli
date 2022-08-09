import { LeafCommand } from 'furious-commander'
import { isV3Wallet } from '../../service/identity'
import { createKeyValue } from '../../utils/text'
import { IdentityCommand } from './identity-command'

export class List extends IdentityCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List keypairs which can be used to sign chunks'

  public run(): void {
    super.init()
    this.throwIfNoIdentities()

    for (const [identityName, identity] of Object.entries(this.commandConfig.config.identities)) {
      const { encryptedWallet } = identity
      let address = ''

      if (isV3Wallet(encryptedWallet)) {
        address = `0x${encryptedWallet.address}`
      }

      this.console.log(createKeyValue('Name', identityName))
      this.console.log(createKeyValue('Address', address))
      this.console.divider()
    }
  }
}
