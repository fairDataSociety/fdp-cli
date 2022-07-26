import { IOption } from 'furious-commander'
import { getPackageVersion } from './utils'
import { Account } from './command/account'
import { Identity } from './command/identity'

export const beeApiUrl: IOption<string> = {
  key: 'bee-api-url',
  default: 'http://localhost:1633',
  description: 'URL of the Bee-client API',
  envKey: 'BEE_API_URL',
}

export const beeDebugApiUrl: IOption<string> = {
  key: 'bee-debug-api-url',
  default: 'http://localhost:1635',
  description: 'URL of the Bee-client Debug API',
  envKey: 'BEE_DEBUG_API_URL',
}

export const configFolder: IOption<string> = {
  key: 'config-folder',
  description: 'Path to the configuration folder that the CLI uses',
  envKey: 'FDP_CLI_CONFIG_FOLDER',
}

export const configFile: IOption<string> = {
  key: 'config-file',
  description: 'Name of the configuration file that the CLI uses',
  envKey: 'FDP_CLI_CONFIG_FILE',
  default: 'config.json',
}

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
    process.stdout.write(getPackageVersion() + '\n')
  },
}

export const verbose: IOption<boolean> = {
  key: 'verbose',
  alias: 'v',
  description: 'Print all console messages',
  type: 'boolean',
  default: false,
}

export const quiet: IOption<boolean> = {
  key: 'quiet',
  alias: 'q',
  description: 'Only print the results',
  type: 'boolean',
  default: false,
}

export const yes: IOption<string[]> = {
  type: 'boolean',
  key: 'yes',
  alias: 'y',
  description: 'Agree to all prompts',
}

export const rootCommandClasses = [Account, Identity]

export const optionParameters: IOption<unknown>[] = [
  beeApiUrl,
  beeDebugApiUrl,
  configFolder,
  configFile,
  help,
  version,
  verbose,
  quiet,
  yes,
]
