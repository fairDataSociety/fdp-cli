import { Account } from './types'

/**
 * Validates that the given wallet is a valid V3 wallet
 */
export function isAccount(account: unknown): account is Account {
  const data = account as Account

  return typeof data === 'object' && data?.encryptedSeed?.length > 0
}
