import { Argument, LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import {
  AccountCommand,
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from './account-command'
import { createKeyValue } from '../../utils/text'
import { Message } from '../../utils/message'
import { CommandLineError } from '../../utils/error'
import { getFieldOrNull } from '../../utils'

export class Register extends AccountCommand implements LeafCommand {
  public readonly name = 'register'

  public readonly description = 'Register a portable FDP account'

  @Argument({
    key: 'username',
    description: 'Username for the portable FDP account',
    type: 'string',
    required: true,
    minimumLength: MIN_USERNAME_LENGTH,
    maximumLength: MAX_USERNAME_LENGTH,
  })
  public username!: string

  @Option({
    key: 'account-password',
    description: 'Password for the portable FDP account',
    type: 'string',
    required: { when: 'quiet' },
    minimumLength: MIN_PASSWORD_LENGTH,
    maximumLength: MAX_PASSWORD_LENGTH,
  })
  public accountPassword!: string

  public async run(): Promise<void> {
    await super.init()

    this.validateBeeDebugAvailable()
    const spinner = createSpinner('Registering new user. This may take a while.')
    let isRegistered = false
    try {
      const mnemonic = await this.getMnemonic()
      await this.checkAccountPassword()

      if (this.verbosity !== VerbosityLevel.Quiet) {
        spinner.start()
      }

      this.fdpStorage.account.setAccountFromMnemonic(mnemonic)
      isRegistered = Boolean(await this.fdpStorage.account.register(this.username, this.accountPassword))
    } catch (error: unknown) {
      const ensError = getFieldOrNull(error, 'error')
      const message: string = getFieldOrNull(error, 'message') || getFieldOrNull(ensError, 'message') || 'unknown error'
      throw new CommandLineError(`Failed to register account: ${message}`)
    } finally {
      if (spinner.isSpinning) {
        spinner.stop()
      }
    }

    if (isRegistered) {
      this.console.log(Message.newAccountRegistered())
      this.console.log(createKeyValue('Username', this.username))
    }
  }

  /**
   * Checks if the account password is valid
   */
  private async checkAccountPassword(): Promise<void> {
    if (!this.accountPassword) {
      if (this.quiet) {
        throw new CommandLineError('Password must be passed with the --account-password option in quiet mode')
      }

      this.console.log(Message.optionNotDefinedWithTitle('account password', 'accountPassword'))
      this.accountPassword = await this.console.askForPasswordWithConfirmation(
        Message.newAccountPassword(),
        Message.newAccountPasswordConfirmation(),
        MIN_PASSWORD_LENGTH,
        MAX_PASSWORD_LENGTH,
      )
    }
  }
}
