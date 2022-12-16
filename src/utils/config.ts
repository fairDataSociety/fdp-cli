import { isNotEmptyString, isObject, isString } from './type'
import { Config } from './types/config'
import { isAccount } from './account'
import { writeFileSync } from 'fs'
import { CommandLineError } from './error'
import { Message } from './message'
import { FdpContracts } from '@fairdatasociety/fdp-storage'
import { ensNetwork } from '../config'
import { Options } from '@fairdatasociety/fdp-storage/dist/types'

export const FDP_PLAY_OPTION_NAME = 'fdp-play'
export const GOERLI_OPTION_NAME = 'goerli'
/**
 * Allowed keys that received from `ens-network` option
 */
export const ALLOWED_ENS_OPTIONS = [GOERLI_OPTION_NAME, FDP_PLAY_OPTION_NAME]

/**
 * Creates config object
 */
export function createConfig(
  beeApiUrl: string | undefined,
  beeDebugApiUrl: string | undefined,
  ensNetwork: string | undefined,
): Config {
  return {
    beeApiUrl: beeApiUrl || '',
    beeDebugApiUrl: beeDebugApiUrl || '',
    ensNetwork: ensNetwork || '',
    mainAccount: '',
    accounts: {},
  }
}

/**
 * Saves config as JSON to the specified path
 */
export function saveConfig(path: string, config: Config): void {
  writeFileSync(path, JSON.stringify(config), { mode: 0o600 })
}

/**
 * Sets and save main user's account
 */
export function setMainAccount(mainAccount: string, path: string, config: Config): void {
  saveConfig(path, { ...config, mainAccount })
}

/**
 * Gets main pod for the account
 */
export function getMainPod(accountName: string, config: Config): string {
  const result = config.accounts[accountName]?.mainPod

  if (!isString(result)) {
    return ''
  }

  return result
}

/**
 * Sets and save main user's pod
 */
export function setMainPod(accountName: string, mainPod: string, path: string, config: Config): void {
  const accounts = { ...config.accounts }

  if (!accounts[accountName]) {
    throw new CommandLineError(Message.noSuchAccount(accountName))
  }

  accounts[accountName].mainPod = mainPod
  saveConfig(path, { ...config, ...accounts })
}

/**
 * Asserts that config content is correct
 */
export function assertConfigContent(value: unknown): asserts value is Config {
  const data = value as Config
  const errorPrefix = 'Config error:'

  function throwError(message: string) {
    throw new Error(`${errorPrefix} ${message}`)
  }

  if (!isObject(value)) {
    throwError('data is not an object')
  }

  if (!isNotEmptyString(data.beeApiUrl)) {
    throwError('`beeApiUrl` is not defined or empty')
  }

  if (!isNotEmptyString(data.beeDebugApiUrl)) {
    throwError('`beeDebugApiUrl` is not defined or empty')
  }

  if (!isNotEmptyString(data.ensNetwork)) {
    throwError('`ensNetwork` is not defined or empty')
  }

  if (!isObject(data.accounts)) {
    throwError('`accounts` is not an object')
  }

  if (!isString(data.mainAccount)) {
    throwError('`mainAccount` is not defined')
  }

  for (const [key, account] of Object.entries(data.accounts)) {
    if (!isNotEmptyString(key)) {
      throwError('account name is empty')
    }

    if (!isAccount(account)) {
      throwError('one of the accounts is not correct')
    }

    if (!isString(account.mainPod)) {
      throwError(`\`mainPod\` is not defined for account \`${key}\``)
    }
  }
}

/**
 * Gets ENS options for initialing `FdpStorage`
 */
export function getEnsConfig(
  optionEnsName: string,
  ensDomain: string | undefined,
  rpcUrl: string | undefined,
): Options {
  if (!ALLOWED_ENS_OPTIONS.includes(optionEnsName)) {
    throw new CommandLineError(Message.optionValueIsNotAllowed(ensNetwork.key, optionEnsName))
  }

  const fdpContractsEnv = FdpContracts.Environments
  const ensOptions = FdpContracts.getEnvironmentConfig(
    optionEnsName === FDP_PLAY_OPTION_NAME ? fdpContractsEnv.LOCALHOST : fdpContractsEnv.GOERLI,
  )
  ensOptions.rpcUrl = rpcUrl || ensOptions.rpcUrl
  ensOptions.performChecks = true

  return {
    ensOptions,
    ensDomain,
  }
}
