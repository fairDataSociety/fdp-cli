import { Argument, LeafCommand, Option } from 'furious-commander'
import { Message } from '../../utils/message'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'
import { exit } from 'process'
import { setMainPod } from '../../utils/config'

export class Delete extends PodCommand implements LeafCommand {
  public readonly name = 'delete'

  public readonly description = 'Delete a pod'

  public postageBatchRequired = true

  @Argument({ key: 'name', description: 'Reference name of the pod' })
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

    await this.promptPodDeletion()
    const currentAccountName = this.getCurrentAccountName(this.account)
    const currentPodName = await this.getCurrentPodName(this.account, this.podName)
    await this.fdpStorage.personalStorage.delete(currentPodName)
    this.console.log(Message.podDeletedSuccessfully())
    this.console.log(createKeyValue('Name', currentPodName))

    if (currentPodName === this.getMainPodName(currentAccountName)) {
      setMainPod(currentAccountName, '', this.commandConfig.configFilePath, this.commandConfig.config)
    }
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
