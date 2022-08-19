import { Application } from 'furious-commander/dist/application'
import PackageJson from '../package.json'

export const application: Application = {
  name: 'FDP CLI',
  command: 'fdp-cli',
  description: 'Manage your FDP accounts via the CLI',
  version: PackageJson.version,
  autocompletion: 'fromOption',
}
