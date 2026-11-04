// Tool packages that `vite-plus` bundles, so the standalone ones are dropped
// when it is used as the project toolchain.
const PROVIDED_PACKAGES = ['vitest', 'oxlint', 'oxfmt'] as const

export type VitePlusFeatures = {
  needsTypeScript?: boolean
  needsVitest?: boolean
  needsEslint?: boolean
  needsOxfmt?: boolean
}

/**
 * Rewrites the scaffolded project to use Vite+ (`vp`) as its toolchain:
 *   - removes the standalone packages that `vite-plus` provides
 *   - routes the dev / build / preview / test / lint / format scripts
 *     through the `vp` CLI
 *
 * ESLint and Prettier are not part of Vite+, so they are left untouched.
 */
export default function applyVitePlus(
  pkg: Record<string, any>,
  { needsTypeScript, needsVitest, needsEslint, needsOxfmt }: VitePlusFeatures,
): void {
  for (const name of PROVIDED_PACKAGES) {
    delete pkg.devDependencies?.[name]
  }

  pkg.scripts = {
    ...pkg.scripts,
    dev: 'vp dev',
    // TypeScript projects keep `run-p type-check build-only` as their build script
    ...(needsTypeScript ? {} : { build: 'vp build' }),
    // `build-only` only exists in TypeScript projects (as the build step without type-checking)
    ...(pkg.scripts['build-only'] ? { 'build-only': 'vp build' } : {}),
    preview: 'vp preview',
    ...(needsVitest ? { 'test:unit': 'vp test' } : {}),
    ...(needsEslint ? { 'lint:oxlint': 'vp lint . --fix' } : {}),
    ...(needsOxfmt ? { format: 'vp fmt src/' } : {}),
  }
}
