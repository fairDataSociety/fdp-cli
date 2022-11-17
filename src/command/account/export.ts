import { writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { CommandLineError } from '../../utils/error'
import { AccountCommand } from './account-command'
import { Message } from '../../utils/message'
import { Account, isAccount } from '../../utils/account'

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

    if (!isAccount(account)) {
      throw new CommandLineError(Message.unsupportedAccountType())
    }

    this.writeAccount(account)
  }

  /**
   * Writes the account to a file or to the console
   */
  private writeAccount(data: Account): void {
    const account = JSON.stringify(data.encryptedSeed, null, 4)

    if (this.outFile) {
      writeFileSync(this.outFile, account)
    } else {
      this.console.log(account)
      this.console.quiet(account)
    }
  }
}
