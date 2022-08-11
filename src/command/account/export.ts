import { writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { isV3Wallet } from '../../service/identity'
import { CommandLineError } from '../../utils/error'
import { AccountCommand } from './account-command'
import { V3Keystore } from '../../service/identity/types'

export class Export extends AccountCommand implements LeafCommand {
  public readonly name = 'export'

  public readonly description = 'Export identity'

  @Argument({ key: 'name', description: 'Name of the identity to be exported' })
  public identityName!: string

  @Option({
    key: 'out-file',
    alias: 'o',
    description: 'Export identity to file',
  })
  public outFile!: string

  public async run(): Promise<void> {
    await super.init()
    const { identity } = await this.getOrPickIdentity(this.identityName)

    if (isV3Wallet(identity.encryptedWallet)) {
      this.writeIdentity(identity.encryptedWallet)
    } else {
      throw new CommandLineError('Unsupported identity type')
    }
  }

  /**
   * Writes the identity to a file or to the console
   */
  private writeIdentity(data: V3Keystore): void {
    const identity = JSON.stringify(data, null, 4)

    if (this.outFile) {
      writeFileSync(this.outFile, identity)
    } else {
      this.console.log(identity)
      this.console.quiet(identity)
    }
  }
}
