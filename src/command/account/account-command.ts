import { Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import { exit } from 'process'
import { Wallet } from 'ethers'
import { getWalletFromIdentity, pickIdentity } from '../../service/identity'
import { Identity } from '../../service/identity/types'

export class AccountCommand extends RootCommand {
  @Option({
    key: 'identity',
    alias: 'i',
    description: 'Name of the identity',
    required: { when: 'quiet' },
  })
  public identity!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the wallet' })
  public password!: string

  protected async init(): Promise<void> {
    await super.init()
  }

  protected async getWallet(): Promise<Wallet> {
    const identity = await this.getIdentity()

    return await getWalletFromIdentity(this.console, this.quiet, identity, this.password)
  }

  private async getIdentity(): Promise<Identity> {
    const { identities } = this.commandConfig.config

    if (this.identity && !identities[this.identity]) {
      if (this.quiet) {
        this.console.error('The provided identity does not exist.')
        exit(1)
      }
      this.console.error('The provided identity does not exist. Please select one that exists.')
    }

    return identities[this.identity] || identities[await pickIdentity(this.commandConfig, this.console)]
  }
}
