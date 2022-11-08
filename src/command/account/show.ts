import { Argument, LeafCommand } from 'furious-commander'
import { exit } from 'process'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { AccountCommand } from './account-command'
import { isAccount } from '../../service/account'
import { decryptSeedString } from '../../utils/wallet'

export class Show extends AccountCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly description = 'Print the HD Wallet seed and the Main Identity properties of an account'

  @Argument({ key: 'name', description: 'Name of the account to show' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()
    const { account } = await this.getOrPickAccount(this.accountName)

    await this.maybePromptForSensitive()

    if (!isAccount(account)) {
      throw new CommandLineError(Message.unsupportedAccountType())
    }

    if (!this.password) {
      this.password = await this.console.askForPassword(Message.portableAccountPassword())
    }

    const seed = decryptSeedString(account.encryptedSeed, this.password)
    this.printSeed(seed)
    this.printSeedQuietly(seed)
  }

  /**
   * Prompts warning about sensitive information output
   */
  private async maybePromptForSensitive(): Promise<void | never> {
    if (this.yes) {
      return
    }

    if (this.quiet && !this.yes) {
      throw new CommandLineError(
        Message.requireOptionConfirmation('yes', 'This will print sensitive information to the console'),
      )
    }

    if (!(await this.console.confirmAndDelete('This will print sensitive information to the console. Continue?'))) {
      exit(0)
    }
  }
}
