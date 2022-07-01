import { IOption } from 'furious-commander'
import PackageJson from '../package.json'

export const help: IOption<boolean> = {
  key: 'help',
  alias: 'h',
  description: 'Print context specific help and exit',
  type: 'boolean',
  default: false,
}

export const version: IOption<boolean> = {
  key: 'version',
  alias: 'V',
  description: 'Print version and exit',
  type: 'boolean',
  default: false,
  handler: () => {
    process.stdout.write(PackageJson.version + '\n')
  },
}

export const rootCommandClasses = [

]

export const optionParameters: IOption<unknown>[] = [
  help,
  version,
]
