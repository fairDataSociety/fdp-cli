import { writeFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { isV3Wallet } from '../../service/identity'
import { CommandLineError } from '../../utils/error'
import { IdentityCommand } from './identity-command'

export class Export extends IdentityCommand implements LeafCommand {
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
      this.writeIdentityString(JSON.stringify(identity.encryptedWallet, null, 4))
    } else {
      throw new CommandLineError('Unsupported identity type')
    }
  }

  private writeIdentityString(identity: string): void {
    if (this.outFile) {
      writeFileSync(this.outFile, identity)
    } else {
      this.console.log(identity)
      this.console.quiet(identity)
    }
  }
}
