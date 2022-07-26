import PackageJson from '../../package.json'
import { statSync } from 'fs'
import { CommandLineError } from './error'

export function getPackageVersion(): string {
  return PackageJson.version
}

export function getFieldOrNull<T>(some: unknown, key: string): T | null {
  return typeof some === 'object' && some !== null ? Reflect.get(some, key) : null
}

export function normalizePrivateKey(string: string): string {
  let normalized = string.toLowerCase()

  if (normalized.startsWith('0x') && normalized.length === 66) {
    normalized = normalized.slice(2)
  }

  return normalized
}

export function isPrivateKey(string: string): boolean {
  const normalized = normalizePrivateKey(string)

  return /^[a-f0-9]{64}$/.test(normalized)
}

export function fileExists(path: string): boolean {
  try {
    const stat = statSync(path)

    return stat.isFile()
  } catch {
    return false
  }
}

export function expectFile(path: string): void {
  if (!fileExists(path)) {
    throw new CommandLineError(`Expected file at path '${path}', found none`)
  }
}
