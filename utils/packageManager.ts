export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

/**
 * Infers the package manager from the user agent string.
 * Falls back to npm if unable to detect.
 */
export function inferPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? ''

  if (/pnpm/.test(userAgent)) return 'pnpm'
  if (/yarn/.test(userAgent)) return 'yarn'
  if (/bun/.test(userAgent)) return 'bun'

  return 'npm'
}

/**
 * Creates an ordered list of package managers with the preferred one first.
 */
export function getPackageManagerOptions(preferred: PackageManager) {
  const all: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']
  return [preferred, ...all.filter((pm) => pm !== preferred)]
}
