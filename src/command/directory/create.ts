import { LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { DirectoryCommand } from './directory-command'

export class Create extends DirectoryCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create a directory'

  public postageBatchRequired = true

  public async run(): Promise<void> {
    await super.init()

    await this.fdpStorage.directory.create(this.getCurrentPodName(this.account, this.pod), this.path)
    this.console.log(Message.directoryCreatedSuccessfully())
    this.console.log(createKeyValue('Name', this.path))
  }
}
