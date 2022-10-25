import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { List } from './list'
import { Delete } from './delete'

export class Pod implements GroupCommand {
  public readonly name = 'pod'

  public readonly description = 'FDS personal storage handling'

  public subCommandClasses = [Create, List, Delete]
}
