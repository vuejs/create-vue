import * as fs from 'node:fs'
import * as path from 'node:path'
import type { PackageManager } from './packageManager'

// Core Vue packages that need to be overridden
// Based on https://github.com/haoqunjiang/install-vue/blob/main/src/constants.ts
const CORE_VUE_PACKAGES = [
  'vue',
  '@vue/compiler-core',
  '@vue/compiler-dom',
  '@vue/compiler-sfc',
  '@vue/compiler-ssr',
  '@vue/compiler-vapor',
  '@vue/reactivity',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@vue/runtime-vapor',
  '@vue/server-renderer',
  '@vue/shared',
  '@vue/compat',
] as const

function generateOverridesMap(): Record<string, string> {
  return Object.fromEntries(CORE_VUE_PACKAGES.map((name) => [name, 'beta']))
}

/**
 * Apply Vue 3.6 beta overrides to the project based on the package manager.
 * Different package managers have different mechanisms for version overrides:
 * - npm/bun: uses `overrides` field in package.json
 * - yarn: uses `resolutions` field in package.json
 * - pnpm: uses `overrides` and `peerDependencyRules` in pnpm-workspace.yaml
 */
export default function applyVueBeta(
  root: string,
  packageManager: PackageManager,
  pkg: Record<string, any>,
): void {
  const overrides = generateOverridesMap()

  if (packageManager === 'npm' || packageManager === 'bun') {
    // https://github.com/npm/rfcs/blob/main/accepted/0036-overrides.md
    // NPM overrides require exact versions for resolution, but "beta" dist-tag works too
    // Bun also supports the same `overrides` field
    pkg.overrides = {
      ...pkg.overrides,
      ...overrides,
    }

    // NPM requires direct dependencies to be rewritten to match overrides
    for (const dependencyName of CORE_VUE_PACKAGES) {
      for (const dependencyType of ['dependencies', 'devDependencies', 'optionalDependencies']) {
        if (pkg[dependencyType]?.[dependencyName]) {
          pkg[dependencyType][dependencyName] = overrides[dependencyName]
        }
      }
    }
  } else if (packageManager === 'yarn') {
    // https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md
    pkg.resolutions = {
      ...pkg.resolutions,
      ...overrides,
    }
  } else if (packageManager === 'pnpm') {
    // pnpm now recommends putting overrides in pnpm-workspace.yaml
    // https://pnpm.io/pnpm-workspace_yaml
    const yamlContent = `overrides:
${Object.entries(overrides)
  .map(([key, value]) => `  '${key}': '${value}'`)
  .join('\n')}

peerDependencyRules:
  allowAny:
    - 'vue'
`

    fs.writeFileSync(path.resolve(root, 'pnpm-workspace.yaml'), yamlContent, 'utf-8')
  }
}
