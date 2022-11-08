import { LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { DirectoryCommand } from './directory-command'

export class Create extends DirectoryCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create a directory'

  public async run(): Promise<void> {
    await super.init()

    await this.setFdpAccount(this.account, this.password)
    await this.fdpStorage.directory.create(this.pod, this.path)
    this.console.log(Message.directoryCreatedSuccessfully())
    this.console.log(createKeyValue('Name', this.path))
  }
}
