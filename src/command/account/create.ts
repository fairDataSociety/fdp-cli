import { Wallet } from 'ethers'
import { Argument, LeafCommand, Utils } from 'furious-commander'
import { Account } from '../../service/account/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createAndRunSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { AccountCommand, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from './account-command'
import { walletToV3 } from '../../utils/wallet'

export class Create extends AccountCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = "Create Ethereum compatible mnemonic to manage account's data"

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the generated account' })
  public accountName!: string

  public async run(): Promise<void> {
    await super.init()

    if (Utils.getSourcemap().name === 'default') {
      this.console.info(`No account name specified, defaulting to '${this.accountName}'`)
    }

    if (this.commandConfig.config.accounts[this.accountName]) {
      throw new CommandLineError(Message.accountNameConflictArgument(this.accountName))
    }

    const wallet = Wallet.createRandom()
    const account = await this.createMnemonicAccount(wallet.mnemonic.phrase)
    const saved = this.commandConfig.saveAccount(this.accountName, account)

    if (!saved) {
      throw new CommandLineError(Message.accountNameConflictArgument(this.accountName))
    }

    this.console.log(createKeyValue('Name', this.accountName))
    this.printWallet(wallet)
    this.printWalletQuietly(wallet)
    this.console.info(Message.topUpBalance())
  }

  /**
   * Creates an encrypted account with a mnemonic
   */
  private async createMnemonicAccount(mnemonic: string): Promise<Account> {
    if (!this.password) {
      this.console.log(Message.optionNotDefined('password'))
      this.password = await this.console.askForPasswordWithConfirmation(
        Message.newMnemonicPassword(),
        Message.newMnemonicPasswordConfirmation(),
        MIN_PASSWORD_LENGTH,
        MAX_PASSWORD_LENGTH,
      )
    }

    const spinner = createAndRunSpinner('Creating mnemonic...', this.verbosity)
    const encryptedWallet = await walletToV3(Wallet.fromMnemonic(mnemonic), this.password)

    spinner.stop()

    return {
      encryptedWallet,
    }
  }
}
