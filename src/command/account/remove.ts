import { Argument, LeafCommand } from 'furious-commander'
import { exit } from 'process'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { AccountCommand } from './account-command'
import { setMainAccount } from '../../utils/config'

export class Remove extends AccountCommand implements LeafCommand {
  public readonly name = 'remove'

  public readonly alias = 'rm'

  public readonly description = 'Remove account'

  @Argument({ key: 'name', description: 'Name of the account to be deleted' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()
    const { name } = await this.getOrPickAccount(this.accountName)

    if (!this.yes) {
      if (this.quiet) {
        throw new CommandLineError(
          Message.requireOptionConfirmation('yes', 'This will delete the account with no way to recover it'),
        )
      }
      const confirmation = await this.console.confirmAndDelete(`Are you sure you want delete the account '${name}'?`)

      if (!confirmation) {
        this.console.log('Aborted')
        exit(0)
      }
    }

    this.commandConfig.removeAccount(name)
    this.console.log(`Account '${name}' has been successfully deleted`)
    setMainAccount('', this.commandConfig.configFilePath, this.commandConfig.config)
  }
}
