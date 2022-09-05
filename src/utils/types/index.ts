/**
 * Asserts whether a valid bytes have been passed
 */
export function assertBytes(bytes: unknown): asserts bytes is Uint8Array {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error('Incorrect bytes')
  }
}
