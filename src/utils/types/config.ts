import { RootCommand } from '../../command/root-command'
import { Account } from '../account'

export interface ConfigOption {
  optionKey: string
  propertyKey: keyof Config & keyof RootCommand
}

/**
 * Config file structure
 */
export interface Config {
  beeApiUrl: string
  beeDebugApiUrl: string
  mainAccount: string
  accounts: { [name: string]: Account }
}
