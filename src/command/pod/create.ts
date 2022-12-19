import { Argument, LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'
import { getMainPod, setMainPod } from '../../utils/config'

export class Create extends PodCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create a pod'

  public postageBatchRequired = true

  @Argument({ key: 'name', description: 'Reference name of the pod' })
  public podName!: string

  public async run(): Promise<void> {
    await super.init()

    await this.fdpStorage.personalStorage.create(this.podName)
    this.console.log(Message.podCreatedSuccessfully())
    this.console.log(createKeyValue('Name', this.podName))

    const account = this.getCurrentAccountName(this.account)

    if (!getMainPod(account, this.commandConfig.config)) {
      setMainPod(account, this.podName, this.commandConfig.configFilePath, this.commandConfig.config)
      this.console.log(Message.newMainPod(this.podName))
    }
  }
}
