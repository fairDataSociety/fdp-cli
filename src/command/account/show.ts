import { Argument, LeafCommand } from 'furious-commander'
import { exit } from 'process'
import { isV3Wallet } from '../../service/account'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { AccountCommand } from './account-command'
import { v3ToWallet } from '../../utils/wallet'

export class Show extends AccountCommand implements LeafCommand {
  public readonly name = 'show'

  public readonly description = 'Print private key, public key and address of an account'

  @Argument({ key: 'name', description: 'Name of the account to show' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()
    const { account } = await this.getOrPickAccount(this.accountName)

    await this.maybePromptForSensitive()

    if (isV3Wallet(account.encryptedWallet)) {
      if (!this.password) {
        this.password = await this.console.askForPassword(Message.existingV3Password())
      }

      const wallet = await v3ToWallet(account.encryptedWallet, this.password)
      this.printWallet(wallet)
      this.printWalletQuietly(wallet)
    } else {
      throw new CommandLineError(Message.unsupportedAccountType())
    }
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
