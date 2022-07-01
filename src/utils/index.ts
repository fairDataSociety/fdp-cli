import PackageJson from '../../package.json'

export function getPackageVersion(): string {
  return PackageJson.version
}

export function getFieldOrNull<T>(some: unknown, key: string): T | null {
  return typeof some === 'object' && some !== null ? Reflect.get(some, key) : null
}
