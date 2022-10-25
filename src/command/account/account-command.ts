import { Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import { exit } from 'process'
import { AccountType, getMnemonicFromAccount, pickAccount } from '../../service/account'
import { Account } from '../../service/account/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { ASK_FOR_PORTABLE_PASSWORD_OPTIONS, VerbosityLevel } from '../root-command/command-log'
import { utils, Wallet } from 'ethers'
import { createKeyValue } from '../../utils/text'
import { createAndRunSpinner } from '../../utils/spinner'
import { walletToV3 } from '../../utils/wallet'
import { isSeed, isString, Seed } from '../../utils/type'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 255
export const MIN_USERNAME_LENGTH = 4
export const MAX_USERNAME_LENGTH = 82
export const HD_PATH = `m/44'/60'/0'/0/0`

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
    const account = await this.getAccount(AccountType.v3Keystore)

    return getMnemonicFromAccount(this.console, this.quiet, account, this.password)
  }

  /**
   * Gets an account from the config
   */
  private async getAccount(accountType: AccountType): Promise<Account> {
    const { accounts } = this.commandConfig.config

    if (this.account && !accounts[this.account]) {
      if (this.quiet) {
        this.console.error('The provided account does not exist.')
        exit(1)
      }

      this.console.error('The provided account does not exist. Please select one that exists.')
    }

    return accounts[this.account] || accounts[await pickAccount(this.commandConfig, this.console, accountType)]
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
   * Asks portable account password with confirmation if it is empty
   */
  protected async askPortableAccountPassword(portablePassword: string, withConfirmation = true): Promise<string> {
    if (portablePassword) {
      return portablePassword
    } else {
      if (this.quiet) {
        throw new CommandLineError(
          `Password must be passed with the --${ASK_FOR_PORTABLE_PASSWORD_OPTIONS.optionName} option in quiet mode`,
        )
      }

      this.console.log(
        Message.optionNotDefinedWithTitle(
          ASK_FOR_PORTABLE_PASSWORD_OPTIONS.optionLabel,
          ASK_FOR_PORTABLE_PASSWORD_OPTIONS.optionName,
        ),
      )

      if (withConfirmation) {
        return this.console.askForPasswordWithConfirmation(
          Message.portableAccountPassword(),
          Message.portableAccountPasswordConfirmation(),
          MIN_PASSWORD_LENGTH,
          MAX_PASSWORD_LENGTH,
        )
      } else {
        return this.console.askForPassword(Message.portableAccountPassword(), ASK_FOR_PORTABLE_PASSWORD_OPTIONS)
      }
    }
  }

  /**
   * Asks to enter a password for an account if the password is not provided
   */
  protected async askPassword(): Promise<void> {
    if (!this.password) {
      this.console.log(Message.optionNotDefined('password'))
      this.password = await this.console.askForPasswordWithConfirmation(
        Message.newAccountPassword(),
        Message.newAccountPasswordConfirmation(),
        MIN_PASSWORD_LENGTH,
        MAX_PASSWORD_LENGTH,
      )
    }
  }

  /**
   * Creates an encrypted account from a mnemonic
   */
  protected async createAccount(seedOrMnemonic: Seed | string): Promise<Account> {
    await this.askPassword()
    const spinner = createAndRunSpinner('Creating account...', this.verbosity)
    let wallet

    if (isString(seedOrMnemonic)) {
      wallet = Wallet.fromMnemonic(seedOrMnemonic)
    } else if (isSeed(seedOrMnemonic)) {
      wallet = new Wallet(utils.HDNode.fromSeed(seedOrMnemonic).derivePath(HD_PATH))
    } else {
      throw new Error('Incorrect data type. Expected seed in form of bytes or mnemonic in form of string')
    }

    const encryptedWallet = await walletToV3(wallet, this.password)
    spinner.stop()

    return {
      encryptedWallet,
    }
  }
}
