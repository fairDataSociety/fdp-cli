import { Argument, LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'

export class Create extends PodCommand implements LeafCommand {
  public readonly name = 'create'

  public readonly description = 'Create a pod'

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the pod' })
  public podName!: string

  public async run(): Promise<void> {
    await super.init()

    await this.setFdpAccount(this.account, this.password)
    await this.fdpStorage.personalStorage.create(this.podName)
    this.console.log(Message.podCreatedSuccessfully())
    this.console.log(createKeyValue('Name', this.podName))
  }
}
