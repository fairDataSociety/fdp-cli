import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'

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

    await this.fillFdpAccount(this.account, this.password)
    const pods = await this.fdpStorage.personalStorage.list()
    for (const pod of [...pods.getPods(), ...pods.getSharedPods()]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isSharedPod = Boolean((pod as unknown).address)
      this.showPodInfo(pod.name, isSharedPod ? 'shared pod' : 'pod')
    }
  }
}
