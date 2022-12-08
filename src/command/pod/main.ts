import { Argument, LeafCommand } from 'furious-commander'
import { Message } from '../../utils/message'
import { getMainPod, setMainPod } from '../../utils/config'
import { PodCommand } from './pod-command'

export class Main extends PodCommand implements LeafCommand {
  public readonly name = 'main'

  public readonly description = 'Set or show main pod'

  @Argument({ key: 'name', description: 'The name of the main pod to be set' })
  public podName!: string

  public async run(): Promise<void> {
    await super.init()

    const account = this.getCurrentAccountName(this.account)

    if (!this.podName) {
      const mainPod = getMainPod(account, this.commandConfig.config)

      if (mainPod) {
        this.console.log(Message.mainPod(mainPod))
      } else {
        this.console.log(Message.mainPodEmpty())
      }

      return
    }

    const pods = await this.fdpStorage.personalStorage.list()
    const allPods = [...pods.getPods(), ...pods.getSharedPods()]

    if (!allPods.find(item => item.name === this.podName)) {
      this.console.log(Message.podNotFound(this.podName))

      return
    }

    setMainPod(account, this.podName, this.commandConfig.configFilePath, this.commandConfig.config)
    this.console.log(Message.newMainPod(this.podName))
  }
}
