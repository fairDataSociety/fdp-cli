import { GroupCommand } from 'furious-commander'
import { Upload } from './upload'
import { Delete } from './delete'
import { Download } from './download'

export class File implements GroupCommand {
  public readonly name = 'file'

  public readonly description = 'FDS directories handling'

  public subCommandClasses = [Upload, Download, Delete]
}
