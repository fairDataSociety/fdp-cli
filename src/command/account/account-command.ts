import { Option, Utils } from 'furious-commander'
import { RootCommand } from '../root-command'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { ASK_FOR_PORTABLE_PASSWORD_OPTIONS } from '../root-command/command-log'
import { createKeyValue } from '../../utils/text'
import { createAndRunSpinner } from '../../utils/spinner'
import { isSeed, Seed } from '../../utils/type'
import { Account, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../utils/account'
import { encryptSeed, getPrintDataFromSeed, mainHDNodeFromSeed } from '../../utils/wallet'
import { setMainAccount } from '../../utils/config'

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
   * Checks the account name and ability to create such an account
   */
  protected accountNameCreationCheck(accountName: string, errorTemplate = Message.accountNameConflictArgument): void {
    if (Utils.getSourcemap().name === 'default') {
      this.console.info(`No account name specified, defaulting to '${accountName}'`)
    }

    if (this.commandConfig.config.accounts[accountName]) {
      throw new CommandLineError(errorTemplate(accountName))
    }
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
   * Prints seed information to the console
   */
  protected printSeed(seed: Seed): void {
    const data = getPrintDataFromSeed(seed)
    this.console.log(createKeyValue('Seed', data.seed))
    this.console.log(createKeyValue('Public key', data.publicKey))
    this.console.log(createKeyValue('Private key', data.privateKey))
    this.console.log(createKeyValue('Address', data.address))
  }

  /**
   * Prints a wallet information to the console in quiet mode
   */
  protected printSeedQuietly(seed: Seed): void {
    const data = getPrintDataFromSeed(seed)
    this.console.quiet(data.seed)
    this.console.quiet(data.publicKey)
    this.console.quiet(data.privateKey)
    this.console.quiet(data.address)
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
   * Creates an encrypted account from a seed
   */
  protected async createAccount(seed: Seed): Promise<Account> {
    if (!isSeed(seed)) {
      throw new Error('Incorrect data type. Expected seed in form of bytes')
    }

    await this.askPassword()
    const spinner = createAndRunSpinner('Creating account...', this.verbosity)

    const encryptedSeed = encryptSeed(seed, this.password)
    spinner.stop()

    return {
      address: mainHDNodeFromSeed(seed).address,
      encryptedSeed,
    }
  }

  /**
   * Initialize first created account as main
   */
  protected initializeDefaultAccount(name: string): void {
    if (Object.entries(this.commandConfig.config.accounts).length !== 1) {
      return
    }

    setMainAccount(name, this.commandConfig.configFilePath, this.commandConfig.config)
  }
}
