import { Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../utils/account'

export class PodCommand extends RootCommand {
  @Option({
    key: 'account',
    alias: 'a',
    description: 'Name of the account',
    required: { when: 'quiet' },
  })
  public account!: string

  @Option({
    key: 'password',
    alias: 'P',
    description: 'Password for the account',
    required: { when: 'quiet' },
    minimumLength: MIN_PASSWORD_LENGTH,
    maximumLength: MAX_PASSWORD_LENGTH,
  })
  public password!: string
  public postageBatchRequired = true

  protected async init(): Promise<void> {
    await super.init()

    this.throwIfNoAccounts()
  }
}
