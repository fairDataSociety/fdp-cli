import { GroupCommand } from 'furious-commander'
import { Register } from './register'
import { Create } from './create'
import { Export } from './export'
import { Import } from './import'
import { List } from './list'
import { Remove } from './remove'
import { Rename } from './rename'
import { Show } from './show'
import { Login } from './login'

export class Account implements GroupCommand {
  public readonly name = 'account'

  public readonly description = 'FDS account handling'

  public subCommandClasses = [Register, Create, Export, Import, List, Remove, Rename, Show, Login]
}
