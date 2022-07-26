import { randomBytes } from 'crypto'
import { Wallet } from 'ethers'
import { Argument, LeafCommand, Option, Utils } from 'furious-commander'
import { getPrintableIdentityType } from '../../service/identity'
import { Identity, IdentityType } from '../../service/identity/types'
import { CommandLineError } from '../../utils/error'
import { Message } from '../../utils/message'
import { createAndRunSpinner } from '../../utils/spinner'
import { createKeyValue } from '../../utils/text'
import { IdentityCommand } from './identity-command'
import { walletToV3 } from '../../utils/wallet'

export class Create extends IdentityCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create Ethereum compatible keypair to sign chunks'

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the generated identity' })
  public identityName!: string

  @Option({ key: 'password', alias: 'P', description: 'Password for the wallet' })
  public password!: string

  @Option({
    key: 'only-keypair',
    alias: 'k',
    type: 'boolean',
    description:
      'Generate only the keypair for the identity. The private key will be stored cleartext. Fast to generate',
  })
  public onlyKeypair!: boolean

  public async run(): Promise<void> {
    await super.init()

    if (Utils.getSourcemap().name === 'default') {
      this.console.info(`No identity name specified, defaulting to '${this.identityName}'`)
    }

    if (this.commandConfig.config.identities[this.identityName]) {
      throw new CommandLineError(Message.identityNameConflictArgument(this.identityName))
    }

    const wallet = Create.generateWallet()
    const identity = this.onlyKeypair ? Create.createPrivateKeyIdentity(wallet) : await this.createV3Identity(wallet)

    const saved = this.commandConfig.saveIdentity(this.identityName, identity)

    if (!saved) {
      throw new CommandLineError(Message.identityNameConflictArgument(this.identityName))
    }

    this.console.log(createKeyValue('Name', this.identityName))
    this.console.log(createKeyValue('Type', getPrintableIdentityType(identity.identityType)))
    this.printWallet(wallet)
    this.printWalletQuietly(wallet)
    this.console.info(
      'In order to register with this identity in ENS you need to top up the balance before registration',
    )
  }

  private async createV3Identity(wallet: Wallet): Promise<Identity> {
    if (!this.password) {
      this.console.log(Message.optionNotDefined('password'))
      this.console.info('If you want to create passwordless keypair, use the --only-keypair option')
      this.password = await this.console.askForPasswordWithConfirmation(
        Message.newV3Password(),
        Message.newV3PasswordConfirmation(),
      )
    }
    const spinner = createAndRunSpinner('Creating V3 wallet...', this.verbosity)
    const v3 = await walletToV3(wallet, this.password)
    spinner.stop()

    return {
      wallet: v3,
      identityType: IdentityType.v3,
    }
  }

  private static createPrivateKeyIdentity(wallet: Wallet): Identity {
    return {
      wallet: {
        privateKey: wallet.privateKey,
      },
      identityType: IdentityType.simple,
    }
  }

  private static generateWallet(): Wallet {
    const privateKey = randomBytes(32)

    return new Wallet(privateKey)
  }
}
