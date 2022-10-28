import { Option } from 'furious-commander'
import { RootCommand } from '../root-command'
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../utils/account'

export class DirectoryCommand extends RootCommand {
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

  @Option({
    key: 'pod',
    description: 'Pod where the directory located',
    required: { when: 'quiet' },
  })
  public pod!: string

  @Option({
    key: 'path',
    description: 'Path of the directory',
    required: { when: 'quiet' },
  })
  public path!: string
  public postageBatchRequired = true

  protected async init(): Promise<void> {
    await super.init()

    this.throwIfNoAccounts()
  }
}
