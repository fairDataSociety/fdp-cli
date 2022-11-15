import { Argument, LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { FileCommand } from './file-command'
import { getString } from '../../utils'

export class Delete extends FileCommand implements LeafCommand {
  public readonly name = 'delete'

  public readonly description = 'Delete a file'

  public postageBatchRequired = true

  @Argument({
    key: 'path-dest',
    description: 'Full destination path of the file in the pod',
    required: true,
  })
  public pathDestination!: string

  public async run(): Promise<void> {
    await super.init()

    try {
      await this.fdpStorage.file.delete(this.pod, this.pathDestination)
      this.console.log(Message.fileDeletedSuccessfully(this.pathDestination))
    } catch (error: unknown) {
      this.console.log(Message.fileDeleteError(getString(error, 'message')))
    }
  }
}
