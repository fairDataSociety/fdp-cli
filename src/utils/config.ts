import { isNotEmptyString, isObject, isString } from './type'
import { Config } from './types/config'
import { isAccount } from './account'

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

  if (!(isString(data.beeDebugApiUrl) && data.beeDebugApiUrl.length > 0)) {
    throwError('`beeDebugApiUrl` is not defined or empty')
  }

  if (!isObject(data.accounts)) {
    throwError('`accounts` is not an object')
  }

  for (const [key, account] of Object.entries(data.accounts)) {
    if (!isNotEmptyString(key)) {
      throwError('account name is empty')
    }

    if (!isAccount(account)) {
      throwError('one of the accounts it not correct')
    }
  }
}
