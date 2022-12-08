import { Argument, LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { FileCommand } from './file-command'
import { readFileSync } from 'fs'
import { expectFile, getString } from '../../utils'

export class Upload extends FileCommand implements LeafCommand {
  public readonly name = 'upload'

  public readonly description = 'Upload a file'

  public postageBatchRequired = true

  @Argument({
    key: 'path-source',
    description: 'Path of the file to upload',
    required: true,
  })
  public pathSource!: string

  @Argument({
    key: 'path-dest',
    description: 'Full destination path of the file in the pod',
    required: true,
  })
  public pathDestination!: string

  public async run(): Promise<void> {
    await super.init()

    try {
      expectFile(this.pathSource)
      const data = readFileSync(this.pathSource)
      await this.fdpStorage.file.uploadData(this.getCurrentPodName(this.account, this.pod), this.pathDestination, data)
      this.console.log(Message.fileUploadedSuccessfully(this.pathSource, this.pathDestination))
    } catch (error: unknown) {
      this.console.log(Message.fileUploadError(getString(error, 'message')))
    }
  }
}
