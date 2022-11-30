import { existsSync, mkdirSync, readFileSync } from 'fs'
import { homedir, platform } from 'os'
import { join } from 'path'
import { exit } from 'process'
import { beeApiUrl, beeDebugApiUrl } from '../../config'
import { Config, ConfigOption } from '../../utils/types/config'
import { CommandLog } from './command-log'
import { assertConfigContent, createConfig, saveConfig } from '../../utils/config'
import { isNotEmptyString } from '../../utils/type'
import { Account } from '../../utils/account'

/**
 * Options listed here will be read from the config file
 * when they are not set explicitly or via `process.env`.
 *
 * `optionKey` is the kebab-case variant of the argument used in the parser, a.k.a. the key,
 * `propertyKey` is the camelCase variant used in TypeScript command classes, a.k.a. the property.
 */
export const CONFIG_OPTIONS: ConfigOption[] = [
  { optionKey: 'bee-api-url', propertyKey: 'beeApiUrl' },
  { optionKey: 'bee-debug-api-url', propertyKey: 'beeDebugApiUrl' },
]

export class CommandConfig {
  public config: Config
  public configFilePath: string
  public configFolderPath: string
  public console: CommandLog

  constructor(appName: string, console: CommandLog, configFile: string, configFolder?: string) {
    this.console = console
    this.config = createConfig(beeApiUrl.default, beeDebugApiUrl.default)
    this.configFolderPath = CommandConfig.getConfigFolderPath(appName, configFolder)
    this.configFilePath = join(this.configFolderPath, configFile)
    this.prepareConfig()
  }

  public saveAccount(name: string, account: Account): boolean {
    if (!isNotEmptyString(name)) {
      throw new Error('Account name is empty')
    }

    if (this.config.accounts?.[name]) {
      return false
    }

    this.config.accounts[name] = account
    this.saveConfig()

    return true
  }

  public removeAccount(name: string): void {
    delete this.config.accounts?.[name]
    this.saveConfig()
  }

  /**
   * Save configuration object to the CLI's config file
   */
  private saveConfig() {
    saveConfig(this.configFilePath, this.config)
  }

  /**
   * Load configuration from config path or creates config folder
   */
  private prepareConfig() {
    if (existsSync(this.configFilePath)) {
      //load config
      const configData = readFileSync(this.configFilePath)
      try {
        this.config = JSON.parse(configData.toString())
        assertConfigContent(this.config)
      } catch (err) {
        this.console.error(
          `There has been an error parsing JSON configuration of CLI from path: '${this.configFilePath}'`,
        )

        exit(1)
      }
    } else {
      if (!existsSync(this.configFolderPath)) {
        mkdirSync(this.configFolderPath, { mode: 0o700, recursive: true })
      }

      //save config initialized in constructor
      this.saveConfig()
    }
  }

  private static getConfigFolderPath(appName: string, configFolder?: string): string {
    if (configFolder) {
      return configFolder
    }

    const homePath = homedir()

    if (platform() === 'win32') {
      return join(homePath, 'AppData', appName)
    } else {
      return join(homePath, `.${appName}`)
    }
  }
}
