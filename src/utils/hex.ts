/**
 * Strips the '0x' hex prefix from a string

 * @param hex string input
 */
export function stripHexPrefix<T extends string>(hex: T): T {
  return hex.startsWith('0x') ? (hex.slice(2) as T) : hex
}

/**
 * Converts a hex string to Uint8Array
 *
 * @param hex string input
 */
export function hexToBytes(hex: string): Uint8Array {
  const hexWithoutPrefix = stripHexPrefix(hex)
  const bytes = new Uint8Array(hexWithoutPrefix.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    const hexByte = hexWithoutPrefix.substr(i * 2, 2)
    bytes[i] = parseInt(hexByte, 16)
  }

  return bytes
}
