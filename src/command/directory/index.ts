import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { Read } from './read'
import { Delete } from './delete'

export class Directory implements GroupCommand {
  public readonly name = 'directory'

  public readonly description = 'FDS directories handling'

  public subCommandClasses = [Create, Read, Delete]
}
