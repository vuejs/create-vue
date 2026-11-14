import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

// Tool packages that `vite-plus` bundles, so the standalone ones are dropped
// when it is used as the project toolchain.
const PROVIDED_PACKAGES = ['vitest', 'oxlint', 'oxfmt'] as const

export type VitePlusFeatures = {
  needsTypeScript?: boolean
  needsVitest?: boolean
}

/**
 * Whether this CLI was spawned by `vp create`.
 * Vite+ (>= 1.6.0) sets `VP_USER_AGENT` for the scaffolding processes it launches.
 * https://github.com/voidzero-dev/vite-plus/pull/1958
 */
export function isLaunchedByVitePlus(): boolean {
  return Boolean(process.env.VP_USER_AGENT)
}

/**
 * Whether a global `vp` binary is available — on `PATH`, or in the Vite+
 * install locations (`$VP_HOME/bin` or `~/.vite-plus/bin`).
 */
export function isVitePlusInstalled(): boolean {
  const binNames = process.platform === 'win32' ? ['vp.cmd', 'vp.exe', 'vp'] : ['vp']
  const binDirs = [
    ...(process.env.VP_HOME ? [path.join(process.env.VP_HOME, 'bin')] : []),
    path.join(os.homedir(), '.vite-plus', 'bin'),
    ...(process.env.PATH ?? '').split(path.delimiter),
  ]

  return binDirs.some((dir) => binNames.some((bin) => fs.existsSync(path.join(dir, bin))))
}

/**
 * Rewrites the scaffolded project to use Vite+ (`vp`) as its toolchain:
 *   - removes the standalone packages that `vite-plus` provides
 *   - routes the dev / build / preview / test scripts through the `vp` CLI
 *   - always adds the `lint` / `format` scripts, because Oxlint and Oxfmt
 *     ship inside `vite-plus`
 *
 * ESLint and Prettier are not part of Vite+, so their templates are never
 * rendered on this path (see index.ts).
 */
export default function applyVitePlus(
  pkg: Record<string, any>,
  { needsTypeScript, needsVitest }: VitePlusFeatures,
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
    lint: 'vp lint . --fix',
    // Oxfmt handles non-JS files too, so it isn't scoped to `src/`
    format: 'vp fmt',
    // Type checking is off in the lint config (`typeCheck: false`), so
    // TypeScript projects still need `vue-tsc` here
    check: needsTypeScript ? 'vp check && vue-tsc --build' : 'vp check',
  }

  // Cypress' dev-mode e2e script invokes `vite dev` directly
  if (typeof pkg.scripts['test:e2e:dev'] === 'string') {
    pkg.scripts['test:e2e:dev'] = pkg.scripts['test:e2e:dev'].replace(/\bvite dev\b/, 'vp dev')
  }
}
