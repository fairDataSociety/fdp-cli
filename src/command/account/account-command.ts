import { Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import { exit } from 'process'
import { getMnemonicFromIdentity, pickIdentity } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { VerbosityLevel } from '../root-command/command-log'
import { Wallet } from 'ethers'
import { createKeyValue } from '../../utils/text'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 255
export const MIN_USERNAME_LENGTH = 4
export const MAX_USERNAME_LENGTH = 82

interface NamedIdentity {
  name: string
  identity: Identity
}

export class AccountCommand extends RootCommand {
  @Option({
    key: 'identity',
    alias: 'i',
    description: 'Name of the identity',
    required: { when: 'quiet' },
  })
  public identity!: string

  @Option({
    key: 'password',
    alias: 'P',
    description: 'Password for the identity',
    required: { when: 'quiet' },
    minimumLength: MIN_PASSWORD_LENGTH,
    maximumLength: MAX_PASSWORD_LENGTH,
  })
  public password!: string

  protected async init(): Promise<void> {
    await super.init()
  }

  /**
   * Gets a mnemonic from an identity
   */
  protected async getMnemonic(): Promise<string> {
    const identity = await this.getIdentity()

    return getMnemonicFromIdentity(this.console, this.quiet, identity, this.password)
  }

  /**
   * Gets an identity from the config
   */
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

  /**
   * Throws an error if there are no identities
   */
  protected throwIfNoIdentities(): void {
    if (!this.commandConfig.config.identities) {
      throw new CommandLineError(Message.noIdentity())
    }
  }

  /**
   * Gets an identity from the config by name or pick it from the list
   */
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

  /**
   * Prints a wallet information to the console
   */
  protected printWallet(wallet: Wallet): void {
    this.console.log(createKeyValue('Mnemonic', wallet.mnemonic.phrase))
    this.console.log(createKeyValue('Public key', wallet.publicKey))
    this.console.log(createKeyValue('Address', wallet.address))
  }

  /**
   * Prints a wallet information to the console in quiet mode
   */
  protected printWalletQuietly(wallet: Wallet): void {
    this.console.quiet(wallet.mnemonic.phrase)
    this.console.quiet(wallet.publicKey)
    this.console.quiet(wallet.address)
  }

  /**
   * Gets an identity by name from the config
   */
  protected getIdentityByName(name: string): Identity {
    const { identities } = this.commandConfig.config

    if (!identities || !identities[name]) {
      throw new CommandLineError(Message.noSuchIdentity(name))
    }

    return identities[name]
  }
}
