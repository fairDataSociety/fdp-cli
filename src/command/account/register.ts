import { Argument, LeafCommand, Option } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { AccountCommand } from './account-command'
import { createKeyValue } from '../../utils/text'
import { Message } from '../../utils/message'
import { CommandLineError } from '../../utils/error'
import { getFieldOrNull } from '../../utils'
import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH } from '../../utils/account'

export class Register extends AccountCommand implements LeafCommand {
  public readonly name = 'register'

  public readonly description = 'Register a portable FDS account'

  public beeRequired = true

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
  public postageBatchRequired = true

  public async run(): Promise<void> {
    await super.init()

    this.validateBeeDebugAvailable()
    await this.validateUsableBatchExists()
    const spinner = createSpinner('Registering new user. This may take a while.')
    let isRegistered = false
    try {
      this.portablePassword = await this.askPortableAccountPassword(this.portablePassword)
      await this.setFdpAccount(this.account, this.password)

      if (this.verbosity !== VerbosityLevel.Quiet) {
        spinner.start()
      }

      isRegistered = Boolean(await this.fdpStorage.account.register(this.username, this.portablePassword))
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
}
