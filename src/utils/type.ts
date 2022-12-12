import { Utils } from '@ethersphere/bee-js'
import { Pod, SharedPod } from '@fairdatasociety/fdp-storage/dist/pod/types'

export const SEED_LENGTH = 64
export type Seed = Utils.Bytes<64>

/**
 * Checks that value is a seed
 */
export function isSeed(value: unknown): value is Seed {
  return Utils.isBytes(value, SEED_LENGTH)
}

/**
 * Checks that value is an object
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

/**
 * Checks that value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Checks that value is a not empty string
 */
export function isNotEmptyString(value: unknown): value is string {
  return isString(value) && value.length > 0
}

/**
 * Gets pod type name
 */
export function getPodTypeName(pod: Pod | SharedPod): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isSharedPod = Boolean((pod as unknown).address)

  return isSharedPod ? 'shared pod' : 'simple pod'
}
