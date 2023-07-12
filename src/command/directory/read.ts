import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { DirectoryCommand } from './directory-command'
import { Message } from '../../utils/message'

export class Read extends DirectoryCommand implements LeafCommand {
  public readonly name = 'read'

  public readonly description = 'Read directory items'

  public async run(): Promise<void> {
    await super.init()

    const directoryItems = await this.fdpStorage.directory.read(
      await this.getCurrentPodName(this.account, this.pod),
      this.path,
    )

    if (directoryItems.directories.length === 0 && directoryItems.files.length === 0) {
      this.console.log(Message.emptyDirectory())

      return
    }

    for (const directory of directoryItems.directories) {
      this.console.log(createKeyValue('Name', directory.name))
      this.console.log(createKeyValue('Type', 'directory'))
      this.console.divider()
    }

    for (const file of directoryItems.files) {
      this.console.log(createKeyValue('Name', file.name))
      this.console.log(createKeyValue('Type', 'file'))

      if (file.size !== undefined) {
        this.console.log(createKeyValue('Size', file.size))
      }

      this.console.divider()
    }
  }
}
