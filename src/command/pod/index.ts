import { GroupCommand } from 'furious-commander'
import { Create } from './create'
import { List } from './list'
import { Delete } from './delete'
import { Main } from './main'

export class Pod implements GroupCommand {
  public readonly name = 'pod'

  public readonly description = 'FDS drive of personal storage handling'

  public subCommandClasses = [Create, List, Delete, Main]
}
