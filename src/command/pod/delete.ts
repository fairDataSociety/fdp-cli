import { Argument, LeafCommand, Option } from 'furious-commander'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'
import { exit } from 'process'

export class Delete extends PodCommand implements LeafCommand {
  public readonly name = 'delete'

  public readonly description = 'Delete a pod'

  @Argument({ key: 'name', default: 'main', description: 'Reference name of the pod' })
  public podName!: string

  @Option({
    type: 'boolean',
    key: 'force',
    alias: 'f',
    description: 'Force deletion without confirmation',
  })
  public force!: boolean

  public async run(): Promise<void> {
    await super.init()

    await this.setFdpAccount(this.account, this.password)
    await this.promptPodDeletion()
    await this.fdpStorage.personalStorage.delete(this.podName)
    this.console.log(Message.podDeletedSuccessfully())
    this.console.log(createKeyValue('Name', this.podName))
  }

  /**
   * Prompts warning about pod deletion
   */
  private async promptPodDeletion(): Promise<void> {
    if (this.force || this.yes) {
      return
    }

    if (!(await this.console.confirmAndDelete('This action will delete the pod without ability to recover. Delete?'))) {
      exit(0)
    }
  }
}
