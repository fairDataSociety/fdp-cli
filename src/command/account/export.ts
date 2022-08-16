import { writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { isV3Wallet } from '../../service/account'
import { CommandLineError } from '../../utils/error'
import { AccountCommand } from './account-command'
import { V3Keystore } from '../../service/account/types'
import { Message } from '../../utils/message'

export class Export extends AccountCommand implements LeafCommand {
  public readonly name = 'export'

  public readonly description = 'Export account'

  @Argument({ key: 'name', description: 'Name of the account to be exported' })
  public accountName!: string

  @Option({
    key: 'out-file',
    alias: 'o',
    description: 'Export account to file',
  })
  public outFile!: string

  public async run(): Promise<void> {
    await super.init()
    const { account } = await this.getOrPickAccount(this.accountName)

    if (isV3Wallet(account.encryptedWallet)) {
      this.writeAccount(account.encryptedWallet)
    } else {
      throw new CommandLineError(Message.unsupportedAccountType())
    }
  }

  /**
   * Writes the account to a file or to the console
   */
  private writeAccount(data: V3Keystore): void {
    const account = JSON.stringify(data, null, 4)

    if (this.outFile) {
      writeFileSync(this.outFile, account)
    } else {
      this.console.log(account)
      this.console.quiet(account)
    }
  }
}
