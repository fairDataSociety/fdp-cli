import { LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { DirectoryCommand } from './directory-command'

export class Delete extends DirectoryCommand implements LeafCommand {
  public readonly name = 'delete'

  public readonly description = 'Delete a directory'

  public postageBatchRequired = true

  public async run(): Promise<void> {
    await super.init()

    await this.fdpStorage.directory.delete(this.pod, this.path)
    this.console.log(Message.directoryDeletedSuccessfully(this.path))
  }
}
