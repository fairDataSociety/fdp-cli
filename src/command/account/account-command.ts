import { Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import { exit } from 'process'
import { getMnemonicFromAccount, pickAccount } from '../../service/account'
import { Account } from '../../service/account/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { VerbosityLevel } from '../root-command/command-log'
import { Wallet } from 'ethers'
import { createKeyValue } from '../../utils/text'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 255
export const MIN_USERNAME_LENGTH = 4
export const MAX_USERNAME_LENGTH = 82

interface NamedAccount {
  name: string
  account: Account
}

export class AccountCommand extends RootCommand {
  @Option({
    key: 'account',
    alias: 'a',
    description: 'Name of the account',
    required: { when: 'quiet' },
  })
  public account!: string

  @Option({
    key: 'password',
    alias: 'P',
    description: 'Password for the account',
    required: { when: 'quiet' },
    minimumLength: MIN_PASSWORD_LENGTH,
    maximumLength: MAX_PASSWORD_LENGTH,
  })
  public password!: string

  protected async init(): Promise<void> {
    await super.init()
  }

  /**
   * Gets a mnemonic from an account
   */
  protected async getMnemonic(): Promise<string> {
    const account = await this.getAccount()

    return getMnemonicFromAccount(this.console, this.quiet, account, this.password)
  }

  /**
   * Gets an account from the config
   */
  private async getAccount(): Promise<Account> {
    const { accounts } = this.commandConfig.config

    if (this.account && !accounts[this.account]) {
      if (this.quiet) {
        this.console.error('The provided account does not exist.')
        exit(1)
      }

      this.console.error('The provided account does not exist. Please select one that exists.')
    }

    return accounts[this.account] || accounts[await pickAccount(this.commandConfig, this.console)]
  }

  /**
   * Throws an error if there are no accounts
   */
  protected throwIfNoAccounts(): void {
    if (!this.commandConfig.config.accounts) {
      throw new CommandLineError(Message.noAccount())
    }
  }

  /**
   * Gets an account from the config by name or pick it from the list
   */
  protected async getOrPickAccount(name?: string | null): Promise<NamedAccount> {
    this.throwIfNoAccounts()

    if (name) {
      return { name, account: this.getAccountByName(name) }
    }

    if (this.verbosity === VerbosityLevel.Quiet) {
      throw new CommandLineError('Account name must be specified when running in --quiet mode')
    }

    const choices = Object.entries(this.commandConfig.config.accounts).map(x => ({
      name: `${x[0]} (0x${x[1].encryptedWallet.address})`,
      value: x[0],
    }))
    const selection = await this.console.promptList(choices, 'Select an account for this action')

    return { name: selection, account: this.getAccountByName(selection) }
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
   * Gets an account by name from the config
   */
  protected getAccountByName(name: string): Account {
    const { accounts } = this.commandConfig.config

    if (!accounts || !accounts[name]) {
      throw new CommandLineError(Message.noSuchAccount(name))
    }

    return accounts[name]
  }

  /**
   * Checks if the account password is valid
   */
  protected async checkPortableAccountPassword(portablePassword: string): Promise<string> {
    if (portablePassword) {
      return portablePassword
    } else {
      if (this.quiet) {
        throw new CommandLineError('Password must be passed with the --portable-password option in quiet mode')
      }

      this.console.log(Message.optionNotDefinedWithTitle('portable password', 'portable-password'))

      return this.console.askForPasswordWithConfirmation(
        Message.portableAccountPassword(),
        Message.portableAccountPasswordConfirmation(),
        MIN_PASSWORD_LENGTH,
        MAX_PASSWORD_LENGTH,
      )
    }
  }
}
