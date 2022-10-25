import { LeafCommand } from 'furious-commander'
import { createKeyValue } from '../../utils/text'
import { PodCommand } from './pod-command'

export class List extends PodCommand implements LeafCommand {
  public readonly name = 'list'

  public readonly alias = 'ls'

  public readonly description = 'List pods'

  public async run(): Promise<void> {
    await super.init()

    await this.fillFdpAccount(this.account, this.password)
    const pods = await this.fdpStorage.personalStorage.list()
    for (const pod of [...pods.getPods(), ...pods.getSharedPods()]) {
      this.console.log(createKeyValue('Name', pod.name))
      this.console.divider()
    }
  }
}
