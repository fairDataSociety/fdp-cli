import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { DirectoryCommand } from './directory-command'
import { Message } from '../../utils/message'

export class Read extends DirectoryCommand implements LeafCommand {
  public readonly name = 'read'

  public readonly description = 'Read directory items'

  public async run(): Promise<void> {
    await super.init()

    await this.fillFdpAccount(this.account, this.password)
    const directoryItems = await this.fdpStorage.directory.read(this.pod, this.path)
    for (const directory of directoryItems.getDirectories()) {
      this.console.log(createKeyValue('Name', directory.name))
      this.console.log(createKeyValue('Type', 'directory'))
      this.console.divider()
    }

    for (const file of directoryItems.getFiles()) {
      this.console.log(createKeyValue('Name', file.name))
      this.console.log(createKeyValue('Type', 'file'))

      if (file.size !== undefined) {
        this.console.log(createKeyValue('Size', file.size))
      }

      this.console.divider()
    }

    if (directoryItems.getDirectories().length === 0 && directoryItems.getFiles().length === 0) {
      this.console.log(Message.emptyDirectory())
    }
  }
}
