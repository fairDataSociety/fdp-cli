import { Argument, LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'

export class Delete extends PodCommand implements LeafCommand {
  public readonly name = 'delete'

  public readonly description = 'Delete a pod'

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the pod' })
  public podName!: string

  public async run(): Promise<void> {
    await super.init()

    await this.fillFdpAccount(this.account, this.password)
    await this.fdpStorage.personalStorage.delete(this.podName)
    this.console.log(Message.podDeletedSuccessfully())
    this.console.log(createKeyValue('Name', this.podName))
  }
}
