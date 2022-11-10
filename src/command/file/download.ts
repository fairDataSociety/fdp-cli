import { Argument, LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { FileCommand } from './file-command'
import { expectFilePathAvailable, getString, saveData } from '../../utils'

export class Download extends FileCommand implements LeafCommand {
  public readonly name = 'download'

  public readonly description = 'Download a file'

  @Argument({
    key: 'path-source',
    description: 'Full path of the file in a pod to download',
    required: true,
  })
  public pathSource!: string

  @Argument({
    key: 'path-dest',
    description: 'Full destination path of the file to be saved',
    required: true,
  })
  public pathDestination!: string

  public async run(): Promise<void> {
    await super.init()

    try {
      expectFilePathAvailable(this.pathDestination)
      await this.setFdpAccount(this.account, this.password)
      const data = await this.fdpStorage.file.downloadData(this.pod, this.pathSource)
      saveData(this.pathDestination, data)
      this.console.log(Message.fileDownloadedSuccessfully(this.pathSource, this.pathDestination))
    } catch (error: unknown) {
      this.console.log(Message.fileDownloadError(getString(error, 'message')))
    }
  }
}
