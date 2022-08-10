import { Argument, LeafCommand } from 'furious-commander'
import { createSpinner } from '../../utils/spinner'
import { VerbosityLevel } from '../root-command/command-log'
import { AccountCommand } from './account-command'
import { createKeyValue } from '../../utils/text'

export class Register extends AccountCommand implements LeafCommand {
  public readonly name = 'register'

  public readonly description = 'Register FDP account'

  @Argument({
    key: 'username',
    description: 'Username for the FDP account',
    type: 'string',
    required: true,
    minimumLength: 8,
    maximumLength: 255,
  })
  public username!: string

  public async run(): Promise<void> {
    await super.init()

    this.validateBeeDebugAvailable()
    const spinner = createSpinner('Registering new user. This may take a while.')
    try {
      const mnemonic = await this.getMnemonic()

      if (this.verbosity !== VerbosityLevel.Quiet) {
        spinner.start()
      }

      this.fdpStorage.account.setAccountFromMnemonic(mnemonic)
      await this.fdpStorage.account.register(this.username, this.password)
      this.console.log(createKeyValue('Username', this.username))
    } finally {
      spinner.stop()
    }
  }
}
