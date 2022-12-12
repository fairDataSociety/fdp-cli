import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'
import { Message } from '../../utils/message'
import { getAllPods } from '../../../test/utility/fdp'
import { getPodTypeName } from '../../utils/type'

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
    const allPods = getAllPods(pods)
    for (const pod of allPods) {
      this.showPodInfo(pod.name, getPodTypeName(pod))
    }

    if (allPods.length === 0) {
      this.console.log(Message.emptyPodsList())
    }
  }
}
