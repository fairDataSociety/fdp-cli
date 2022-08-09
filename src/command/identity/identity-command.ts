import { Wallet } from 'ethers'
import { Identity } from '../../service/identity/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { RootCommand } from '../root-command'
import { VerbosityLevel } from '../root-command/command-log'

interface NamedIdentity {
  name: string
  identity: Identity
}

export class IdentityCommand extends RootCommand {
  protected throwIfNoIdentities(): void {
    if (!this.commandConfig.config.identities) {
      throw new CommandLineError(Message.noIdentity())
    }
  }

  protected async getOrPickIdentity(name?: string | null): Promise<NamedIdentity> {
    this.throwIfNoIdentities()

    if (name) {
      return { name, identity: this.getIdentityByName(name) }
    }

    if (this.verbosity === VerbosityLevel.Quiet) {
      throw new CommandLineError('Identity name must be specified when running in --quiet mode')
    }

    const choices = Object.entries(this.commandConfig.config.identities).map(x => ({
      name: `${x[0]} (0x${x[1].encryptedWallet.address})`,
      value: x[0],
    }))
    const selection = await this.console.promptList(choices, 'Select an identity for this action')

    return { name: selection, identity: this.getIdentityByName(selection) }
  }

  protected printWallet(wallet: Wallet): void {
    this.console.log(createKeyValue('Mnemonic', wallet.mnemonic.phrase))
    this.console.log(createKeyValue('Public key', wallet.publicKey))
    this.console.log(createKeyValue('Address', wallet.address))
  }

  protected printWalletQuietly(wallet: Wallet): void {
    this.console.quiet(wallet.mnemonic.phrase)
    this.console.quiet(wallet.publicKey)
    this.console.quiet(wallet.address)
  }

  protected getIdentityByName(name: string): Identity {
    const { identities } = this.commandConfig.config

    if (!identities || !identities[name]) {
      throw new CommandLineError(Message.noSuchIdentity(name))
    }

    return identities[name]
  }
}
