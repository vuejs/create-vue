import * as fs from 'node:fs'
import * as path from 'node:path'
import type { PackageManager } from './packageManager'

// Core Vue packages that need to be overridden for the Vue 3.6 RC
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

// https://github.com/johnsoncodehk/typescript-native-bridge
// A drop-in `typescript` replacement backed by tsgo (the Go engine of TypeScript 7),
// which keeps the classic `typescript` API surface so that vue-tsc, typescript-eslint,
// and tsserver plugins keep working.
const TSGO_SPEC = 'npm:typescript-native-bridge@latest'

// Vite+ bundles its own Vite core. Aliasing the `vite` dependency to it keeps a
// single copy in the dependency tree, shared with `vite-plus` itself and with
// the peer dependencies of plugins like `@vitejs/plugin-vue`.
const VITE_PLUS_CORE_SPEC = 'npm:@voidzero-dev/vite-plus-core@^1.4.0'

export type OverrideFeatures = {
  vueRc?: boolean
  tsgo?: boolean
  vitePlus?: boolean
}

/**
 * Apply version overrides for experimental features to the project,
 * based on the package manager.
 * Different package managers have different mechanisms for version overrides:
 * - npm/bun: uses `overrides` field in package.json
 * - yarn: uses `resolutions` field in package.json
 * - pnpm: uses `overrides` and `peerDependencyRules` in pnpm-workspace.yaml
 * - nub: uses the neutral `overrides` field in package.json
 */
export default function applyOverrides(
  root: string,
  packageManager: PackageManager,
  pkg: Record<string, any>,
  { vueRc = false, tsgo = false, vitePlus = false }: OverrideFeatures,
): void {
  const overrides: Record<string, string> = {}
  if (vueRc) {
    for (const name of CORE_VUE_PACKAGES) {
      overrides[name] = 'rc'
    }
  }

  if (vitePlus && pkg.devDependencies?.vite) {
    // Point the direct `vite` dependency at the Vite+ core for every package
    // manager, so the manifests stay honest about what is actually resolved.
    pkg.devDependencies.vite = VITE_PLUS_CORE_SPEC
  }

  if (packageManager === 'npm' || packageManager === 'bun') {
    // https://github.com/npm/rfcs/blob/main/accepted/0036-overrides.md
    // NPM overrides require exact versions for resolution, but the "rc" dist-tag works too
    // Bun also supports the same `overrides` field
    if (tsgo) {
      // Putting an `npm:` alias directly inside `overrides` is rejected or
      // mis-resolved by some npm versions, so the alias goes on the direct
      // dependency and the override references it via "$typescript".
      // https://github.com/johnsoncodehk/typescript-native-bridge (issue #8)
      overrides['typescript'] = '$typescript'
    }
    pkg.overrides = {
      ...pkg.overrides,
      ...overrides,
    }

    // NPM requires direct dependencies to be rewritten to match overrides
    for (const dependencyName of Object.keys(overrides)) {
      for (const dependencyType of ['dependencies', 'devDependencies', 'optionalDependencies']) {
        if (pkg[dependencyType]?.[dependencyName]) {
          pkg[dependencyType][dependencyName] =
            dependencyName === 'typescript' ? TSGO_SPEC : overrides[dependencyName]
        }
      }
    }

    if (vitePlus) {
      // The direct `vite` dependency already carries the alias, so the override
      // references it via "$vite" to keep both in sync (same trick as tsgo above).
      pkg.overrides = {
        ...pkg.overrides,
        vite: '$vite',
      }
    }
  } else if (packageManager === 'yarn') {
    // https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md
    if (tsgo) {
      overrides['typescript'] = TSGO_SPEC
    }
    if (vitePlus) {
      overrides['vite'] = VITE_PLUS_CORE_SPEC
    }
    pkg.resolutions = {
      ...pkg.resolutions,
      ...overrides,
    }
  } else if (packageManager === 'pnpm') {
    // pnpm now recommends putting overrides in pnpm-workspace.yaml
    // https://pnpm.io/pnpm-workspace_yaml
    if (tsgo) {
      overrides['typescript'] = TSGO_SPEC
    }
    if (vitePlus) {
      overrides['vite'] = VITE_PLUS_CORE_SPEC
    }
    let yamlContent = `overrides:
${Object.entries(overrides)
  .map(([key, value]) => `  '${key}': '${value}'`)
  .join('\n')}
`

    const peerDependencyRules: string[] = []
    if (vueRc) {
      peerDependencyRules.push(`  allowAny:
    - 'vue'
`)
    }
    if (vitePlus) {
      // `vite-plus-core` is versioned like Vite+ itself, not like Vite,
      // so peers such as `@vitejs/plugin-vue` need their range check relaxed.
      peerDependencyRules.push(`  allowedVersions:
    vite: '*'
`)
    }
    if (peerDependencyRules.length) {
      yamlContent += `
peerDependencyRules:
${peerDependencyRules.join('')}`
    }

    fs.writeFileSync(path.resolve(root, 'pnpm-workspace.yaml'), yamlContent, 'utf-8')
  } else if (packageManager === 'nub') {
    // nub is pnpm-CLI-compatible but reads project config only from neutral,
    // cross-tool fields — not pnpm-named files like pnpm-workspace.yaml — so its
    // overrides go in the `overrides` field in package.json. Unlike npm, nub does
    // not require direct dependencies to be rewritten to match, so the override
    // map alone is sufficient.
    if (tsgo) {
      overrides['typescript'] = TSGO_SPEC
    }
    if (vitePlus) {
      overrides['vite'] = VITE_PLUS_CORE_SPEC
    }
    pkg.overrides = {
      ...pkg.overrides,
      ...overrides,
    }
  }
}
