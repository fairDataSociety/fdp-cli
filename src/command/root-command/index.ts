import { ExternalOption, Sourcemap, Utils } from 'furious-commander'
import { ConfigOption } from '../../utils/types/config'
import { CommandConfig, CONFIG_OPTIONS } from './command-config'
import { CommandLog, VerbosityLevel } from './command-log'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { exit } from 'process'
import { Message } from '../../utils/message'
import { BeeDebug } from '@ethersphere/bee-js'
import { assertBatchId } from '../../../test/utils'
import { getUsableBatch, isUsableBatchExists, ZERO_BATCH_ID } from '../../utils/bee'
import { CommandLineError } from '../../utils/error'
import { Account, isAccount } from '../../utils/account'
import { decryptAccount, uncompressedPublicKeyFromSeed } from '../../utils/wallet'
import { getAllPods } from '../../../test/utility/fdp'
import { getPodTypeName } from '../../utils/type'
import { getEnsConfig } from '../../utils/config'

interface NamedAccount {
  name: string
  account: Account
}

export class RootCommand {
  @ExternalOption('ens-network')
  public ensNetwork!: string

  @ExternalOption('ens-domain')
  public ensDomain!: string

  @ExternalOption('ens-rpc-url')
  public ensRpcUrl!: string

  @ExternalOption('bee-api-url')
  public beeApiUrl!: string

  @ExternalOption('bee-debug-api-url')
  public beeDebugApiUrl!: string

  @ExternalOption('config-folder')
  public configFolder!: string

  @ExternalOption('config-file')
  public configFile!: string

  @ExternalOption('verbosity')
  public verbosity!: VerbosityLevel

  @ExternalOption('verbose')
  public verbose!: boolean

  @ExternalOption('quiet')
  public quiet!: boolean

  @ExternalOption('header')
  public header!: string[]

  @ExternalOption('yes')
  public yes!: boolean

  public fdpStorage!: FdpStorage
  public console!: CommandLog
  public readonly appName = 'fdp-cli'
  public commandConfig!: CommandConfig
  public postageBatchRequired!: boolean
  private sourcemap!: Sourcemap
  /**
   * Store Debug API errors here. It cannot be determined beforehand if Debug API is going to be used,
   * since it is optional for some commands. The `beeDebug` getter should check if there are any errors
   * here. Since the checks require async operations, this logic cannot be in the getter.
   */
  private debugApiErrors: string[] = []

  private async setupBeeDebug(): Promise<void> {
    if (this.shouldDebugUrlBeSpecified()) {
      this.debugApiErrors.push('Cannot ensure Debug API correctness!')
      this.debugApiErrors.push('--bee-api-url is set explicitly, but --bee-debug-api-url is left default.')
      this.debugApiErrors.push('This may be incorrect and cause unexpected behaviour.')
      this.debugApiErrors.push('Please run the command again and specify explicitly the --bee-debug-api-url value.')
    } else {
      if (!(await this.checkDebugApiHealth())) {
        this.debugApiErrors.push('Could not reach Debug API at ' + this.beeDebugApiUrl)
        this.debugApiErrors.push('Make sure you have the Debug API enabled in your Bee config')
        this.debugApiErrors.push('or correct the URL with the --bee-debug-api-url option.')
      }
    }
  }

  protected debugApiIsUsable(): boolean {
    return this.debugApiErrors.length === 0
  }

  public validateBeeDebugAvailable(): void {
    if (!this.debugApiIsUsable()) {
      for (const message of this.debugApiErrors) {
        this.console.error(message)
      }

      exit(1)
    }
  }

  /**
   * Checks availability of the usable batch
   */
  public async validateUsableBatchExists(): Promise<void> {
    if (!(await isUsableBatchExists(this.beeDebugApiUrl))) {
      this.console.error(Message.noUsableBatch())

      exit(1)
    }
  }

  protected async init(): Promise<void> {
    this.commandConfig = new CommandConfig(this.appName, this.console, this.configFile, this.configFolder)
    this.sourcemap = Utils.getSourcemap()

    CONFIG_OPTIONS.forEach((option: ConfigOption) => {
      this.maybeSetFromConfig(option)
    })

    this.verbosity = VerbosityLevel.Normal

    if (this.quiet) {
      this.verbosity = VerbosityLevel.Quiet
    } else if (this.verbose) {
      this.verbosity = VerbosityLevel.Verbose
    }
    this.console = new CommandLog(this.verbosity)
    let batchId = ZERO_BATCH_ID

    if (this.postageBatchRequired) {
      batchId = await getUsableBatch(this.beeDebugApiUrl)
    }

    assertBatchId(batchId)
    this.fdpStorage = new FdpStorage(
      this.beeApiUrl,
      batchId,
      getEnsConfig(this.ensNetwork, this.ensDomain, this.ensRpcUrl),
    )

    await this.setupBeeDebug()
  }

  private maybeSetFromConfig(option: ConfigOption): void {
    if (this.sourcemap[option.optionKey] === 'default') {
      const value = this.commandConfig.config[option.propertyKey]

      if (value !== undefined) {
        this[option.propertyKey] = value
      }
    }
  }

  /**
   * Used to catch confusing behaviour, which happens when only one of the Bee APIs is specified.
   *
   * e.g. A command uses both the Bee API and the Bee Debug API. The user specifies a remote Bee node
   *      for the normal API, but forgets about the debug API. The command would run successfully,
   *      but have confusing results, as two different Bee nodes are used when calling the APIs.
   *
   * @returns true is Bee API URL is set explicity, but Bee Debug API URL is left default.
   */
  private shouldDebugUrlBeSpecified(): boolean {
    return this.sourcemap['bee-api-url'] === 'explicit' && this.sourcemap['bee-debug-api-url'] === 'default'
  }

  private async checkDebugApiHealth(): Promise<boolean> {
    const beeDebug = new BeeDebug(this.beeDebugApiUrl)
    try {
      const health = await beeDebug.getHealth()

      return health.status === 'ok'
    } catch (error) {
      return false
    }
  }

  /**
   * Throws an error if there are no accounts
   */
  protected throwIfNoAccounts(): void {
    if (!this.commandConfig.config.accounts) {
      throw new CommandLineError(Message.noAccount())
    }
  }

  /**
   * Fill FDP instance with decrypted seed
   *
   * @param name name of stored account
   * @param password password for decrypting the account
   * @protected
   */
  protected async setFdpAccount(name?: string | null, password?: string | null): Promise<void> {
    const { account } = await this.getOrPickAccount(name ? name : this.commandConfig.config.mainAccount)

    if (!password) {
      if (this.quiet) {
        throw new CommandLineError(`Password must be passed with the --password option in quiet mode`)
      }

      password = await this.console.askForPassword(Message.portableAccountPassword())
    }

    if (isAccount(account)) {
      const seed = decryptAccount(account, password)
      this.fdpStorage.account.setAccountFromSeed(seed)
      this.fdpStorage.account.publicKey = uncompressedPublicKeyFromSeed(seed)
    } else {
      throw new CommandLineError(Message.unsupportedAccountType())
    }
  }

  /**
   * Gets an account from the config by name or pick it from the list
   */
  protected async getOrPickAccount(name?: string | null): Promise<NamedAccount> {
    this.throwIfNoAccounts()

    if (name) {
      return { name, account: this.getAccountByName(name) }
    }

    if (this.verbosity === VerbosityLevel.Quiet) {
      throw new CommandLineError('Account name must be specified when running in --quiet mode')
    }

    const choices = Object.entries(this.commandConfig.config.accounts).map(accountInfo => {
      const name = accountInfo[0]
      const account = accountInfo[1]

      return {
        name: `${name} (${account.address})`,
        value: name,
      }
    })
    const selection = await this.console.promptList(choices, 'Select an account for this action')

    return { name: selection, account: this.getAccountByName(selection) }
  }

  /**
   * Gets an account by name from the config
   */
  protected getAccountByName(name: string): Account {
    const { accounts } = this.commandConfig.config

    if (!accounts || !accounts[name]) {
      throw new CommandLineError(Message.noSuchAccount(name))
    }

    return accounts[name]
  }

  /**
   * Gets passed account name or main account name
   */
  protected getCurrentAccountName(accountName: string): string {
    return accountName ? accountName : this.commandConfig.config.mainAccount
  }

  /**
   * Gets main pod name by account name
   */
  protected getMainPodName(accountName: string): string {
    return this.commandConfig.config.accounts[accountName].mainPod
  }

  /**
   * Gets passed pod name or main user's pod name
   */
  protected async getCurrentPodName(accountName: string, podName: string): Promise<string> {
    if (podName) {
      return podName
    }

    const account = this.getCurrentAccountName(accountName)
    let result = this.getMainPodName(account)

    if (!result && this.verbosity === VerbosityLevel.Quiet) {
      throw new CommandLineError('Pod name must be specified when running in --quiet mode')
    } else if (!result) {
      const pods = getAllPods(await this.fdpStorage.personalStorage.list())

      if (pods.length === 0) {
        throw new CommandLineError(Message.emptyPodsList())
      }

      const choices = pods.map(pod => ({
        name: `${pod.name} (${getPodTypeName(pod)})`,
        value: pod.name,
      }))
      result = await this.console.promptList(choices, 'Select a pod for this action')
    }

    return result
  }
}
