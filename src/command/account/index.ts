import { GroupCommand } from 'furious-commander'
import { Register } from './register'

export class Account implements GroupCommand {
  public readonly name = 'account'

  public readonly description = 'FDP account handling'

  public subCommandClasses = [Register]
}
