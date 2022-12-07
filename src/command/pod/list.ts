import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'
import { Message } from '../../utils/message'

export class List extends PodCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List pods'

  /**
   * Shows pod information
   */
  private showPodInfo(podName: string, podType: string): void {
    this.console.log(createKeyValue('Name', podName))
    this.console.log(createKeyValue('Type', podType))
    this.console.divider()
  }

  public async run(): Promise<void> {
    await super.init()

    const pods = await this.fdpStorage.personalStorage.list()
    const allPods = [...pods.getPods(), ...pods.getSharedPods()]
    for (const pod of allPods) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isSharedPod = Boolean((pod as unknown).address)
      this.showPodInfo(pod.name, isSharedPod ? 'shared pod' : 'pod')
    }

    if (allPods.length === 0) {
      this.console.log(Message.emptyPodsList())
    }
  }
}
