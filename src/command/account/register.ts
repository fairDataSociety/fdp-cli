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
    minimumLength: 1,
    maximumLength: 255,
  })
  public fdpUsername!: string

  @Argument({
    key: 'fdpPassword',
    description: 'Password for the FDP account',
    type: 'string',
    required: true,
    minimumLength: 1,
    maximumLength: 255,
  })
  public fdpPassword!: string

  public async run(): Promise<void> {
    await super.init()

    this.validateBeeDebugAvailable()
    const spinner = createSpinner('Registering new user. This may take a while.')
    try {
      const wallet = await this.getWallet()

      if (this.verbosity !== VerbosityLevel.Quiet) {
        spinner.start()
      }

      this.fdpStorage.account.setActiveAccount(wallet)
      await this.fdpStorage.account.register(this.fdpUsername, this.fdpPassword)
      this.console.log(createKeyValue('Username', this.fdpUsername))
    } finally {
      spinner.stop()
    }
  }
}
