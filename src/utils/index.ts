import PackageJson from '../../package.json'
import { statSync, writeFileSync } from 'fs'
import { CommandLineError } from './error'

export function getPackageVersion(): string {
  return PackageJson.version
}

/**
 * Gets string from object or return empty string
 */
export function getString(some: unknown, key: string): string {
  return typeof some === 'object' && some !== null ? Reflect.get(some, key) : ''
}

export function getFieldOrNull<T>(some: unknown, key: string): T | null {
  return typeof some === 'object' && some !== null ? Reflect.get(some, key) : null
}

export function fileExists(path: string): boolean {
  try {
    const stat = statSync(path)

    return stat.isFile()
  } catch {
    return false
  }
}

/**
 * Checks that exists something except of file
 */
export function notFileExists(path: string): boolean {
  try {
    const stat = statSync(path)

    return (
      stat.isDirectory() ||
      stat.isFIFO() ||
      stat.isSocket() ||
      stat.isSymbolicLink() ||
      stat.isCharacterDevice() ||
      stat.isBlockDevice()
    )
  } catch {
    return false
  }
}

/**
 * Checks that path available for writing.
 *
 * Path should be a file for rewriting or nothing
 */
export function pathAvailable(path: string): boolean {
  try {
    return !notFileExists(path)
  } catch (e) {
    return false
  }
}

/**
 * Validates that file path is available
 */
export function expectFilePathAvailable(path: string): void {
  if (!pathAvailable(path)) {
    throw new CommandLineError(`Path '${path}' is not available for writing`)
  }
}

export function expectFile(path: string): void {
  if (!fileExists(path)) {
    throw new CommandLineError(`Expected file at path '${path}', found none`)
  }
}

/**
 * Writes data to a file, replacing the file if it already exists
 *
 * @param path path of a file
 * @param data the data to write
 */
export function saveData(path: string, data: Uint8Array): void {
  writeFileSync(path, data)
}
