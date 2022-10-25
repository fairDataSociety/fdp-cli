import { Utils } from '@ethersphere/bee-js'

export const SEED_LENGTH = 64
export type Seed = Utils.Bytes<64>

/**
 * Checks that value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Checks that value is a seed
 */
export function isSeed(value: unknown): value is Seed {
  return Utils.isBytes(value, SEED_LENGTH)
}
