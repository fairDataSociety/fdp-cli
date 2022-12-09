import { Argument, LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { AccountCommand } from './account-command'
import { Message } from '../../utils/message'
import { CommandLineError } from '../../utils/error'
import { getFieldOrNull } from '../../utils'
import { assertBytes } from '../../utils/types'
import { Utils } from '@ethersphere/bee-js'
import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '../../utils/account'

export class Login extends AccountCommand implements LeafCommand {
  public readonly name = 'login'

  public readonly description = 'Login to a portable FDS account'

  @Argument({
    key: 'username',
    alias: 'u',
    description: 'Username for the portable FDS account',
    type: 'string',
    required: true,
    minimumLength: MIN_USERNAME_LENGTH,
    maximumLength: MAX_USERNAME_LENGTH,
  })
  public username!: string

  @Option({
    key: 'portable-password',
    alias: 'p',
    description: 'Password for the portable FDS account',
    type: 'string',
    required: { when: 'quiet' },
    minimumLength: MIN_PASSWORD_LENGTH,
    maximumLength: MAX_PASSWORD_LENGTH,
  })
  public portablePassword!: string

  public async run(): Promise<void> {
    await super.init()

    if (this.commandConfig.config.accounts[this.username]) {
      throw new CommandLineError(Message.accountNameConflictArgument(this.username))
    }

    this.portablePassword = await this.askPortableAccountPassword(this.portablePassword, false)
    const spinner = createSpinner('Logging in to FDS account. This may take a while.')

    let isSaved = false
    try {
      if (this.verbosity !== VerbosityLevel.Quiet) {
        spinner.start()
      }

      await this.fdpStorage.account.login(this.username, this.portablePassword)
      assertBytes(this.fdpStorage.account.seed)
      spinner.stop()
      const account = await this.createAccount(this.fdpStorage.account.seed as Utils.Bytes<64>)
      isSaved = this.commandConfig.saveAccount(this.username, account)
    } catch (error: unknown) {
      const ensError = getFieldOrNull(error, 'error')
      const message: string = getFieldOrNull(error, 'message') || getFieldOrNull(ensError, 'message') || 'unknown error'
      throw new CommandLineError(`Failed to login to account: ${message}`)
    } finally {
      if (spinner.isSpinning) {
        spinner.stop()
      }
    }

    if (isSaved) {
      this.console.log(Message.loggedInSuccessfully())
      this.initializeDefaultAccount(this.username)
    } else {
      throw new CommandLineError(Message.accountNameConflictArgument(this.username))
    }
  }
}
