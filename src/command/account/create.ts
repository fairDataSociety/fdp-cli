import { Wallet } from 'ethers'
import { Argument, LeafCommand, Utils } from 'furious-commander'
import { Identity } from '../../service/identity/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createAndRunSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { AccountCommand, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from './account-command'
import { walletToV3 } from '../../utils/wallet'

export class Create extends AccountCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = "Create Ethereum compatible mnemonic to manage account's data"

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the generated identity' })
  public identityName!: string

  public async run(): Promise<void> {
    await super.init()

    if (Utils.getSourcemap().name === 'default') {
      this.console.info(`No identity name specified, defaulting to '${this.identityName}'`)
    }

    if (this.commandConfig.config.identities[this.identityName]) {
      throw new CommandLineError(Message.identityNameConflictArgument(this.identityName))
    }

    const wallet = Wallet.createRandom()
    const identity = await this.createMnemonicIdentity(wallet.mnemonic.phrase)
    const saved = this.commandConfig.saveIdentity(this.identityName, identity)

    if (!saved) {
      throw new CommandLineError(Message.identityNameConflictArgument(this.identityName))
    }

    this.console.log(createKeyValue('Name', this.identityName))
    this.printWallet(wallet)
    this.printWalletQuietly(wallet)
    this.console.info(Message.topUpBalance())
  }

  /**
   * Creates an encrypted identity with a mnemonic
   */
  private async createMnemonicIdentity(mnemonic: string): Promise<Identity> {
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
