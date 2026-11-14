/// <reference types="node" />

import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { it, describe, expect, afterEach } from 'vite-plus/test'
import applyVitePlus, { isLaunchedByVitePlus, isVitePlusInstalled } from '../utils/vitePlus'
import applyOverrides from '../utils/applyOverrides'

function createPackageJson(): Record<string, any> {
  return {
    scripts: {
      dev: 'vite',
      build: 'vite build',
      'build-only': 'vite build',
      preview: 'vite preview',
      'test:unit': 'vitest',
    },
    devDependencies: {
      vite: 'npm:@voidzero-dev/vite-plus-core@^1.6.0',
      'vite-plus': '^1.6.0',
      vitest: '^5.0.5',
    },
  }
}

describe('applyVitePlus', () => {
  it('routes all tool scripts through vp and drops bundled packages', () => {
    const pkg = createPackageJson()

    applyVitePlus(pkg, { needsVitest: true })

    expect(pkg.scripts).toStrictEqual({
      dev: 'vp dev',
      build: 'vp build',
      'build-only': 'vp build',
      preview: 'vp preview',
      'test:unit': 'vp test',
      lint: 'vp lint . --fix',
      format: 'vp fmt src/',
    })
    expect(pkg.devDependencies).toStrictEqual({
      vite: 'npm:@voidzero-dev/vite-plus-core@^1.6.0',
      'vite-plus': '^1.6.0',
    })
  })

  it('keeps the type-check step in the build script for TypeScript projects', () => {
    const pkg = createPackageJson()
    pkg.scripts.build = 'run-p type-check "build-only {@}" --'

    applyVitePlus(pkg, { needsTypeScript: true })

    expect(pkg.scripts.build).toBe('run-p type-check "build-only {@}" --')
    expect(pkg.scripts['build-only']).toBe('vp build')
  })

  it('always adds lint and format scripts, even without Vitest', () => {
    const pkg = createPackageJson()
    delete pkg.scripts['test:unit']

    applyVitePlus(pkg, {})

    expect(pkg.scripts).toStrictEqual({
      dev: 'vp dev',
      build: 'vp build',
      'build-only': 'vp build',
      preview: 'vp preview',
      lint: 'vp lint . --fix',
      format: 'vp fmt src/',
    })
  })
})

describe('applyOverrides with vitePlus', () => {
  const spec = 'npm:@voidzero-dev/vite-plus-core@^1.6.0'
  const createPkg = (): Record<string, any> => ({
    devDependencies: { vite: spec, 'vite-plus': '^1.6.0' },
  })

  it('references the aliased direct dependency via "$vite" for npm and bun', () => {
    for (const packageManager of ['npm', 'bun'] as const) {
      const pkg = createPkg()

      applyOverrides('', packageManager, pkg, { vitePlus: true })

      // The alias spec itself is declared in the `config/vite-plus` template
      // manifest, so it is left untouched here.
      expect(pkg.devDependencies.vite).toBe(spec)
      expect(pkg.overrides).toStrictEqual({ vite: '$vite' })
    }
  })

  it('reuses the manifest spec in yarn resolutions', () => {
    const pkg = createPkg()

    applyOverrides('', 'yarn', pkg, { vitePlus: true })

    expect(pkg.resolutions).toStrictEqual({ vite: spec })
  })

  it('reuses the manifest spec in pnpm-workspace.yaml and relaxes the vite peer range', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'create-vue-'))
    const pkg = createPkg()

    applyOverrides(root, 'pnpm', pkg, { vitePlus: true })

    const yaml = fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf-8')
    expect(yaml).toContain(`'vite': '${spec}'`)
    expect(yaml).toContain('allowedVersions')
    fs.rmSync(root, { recursive: true, force: true })
  })
})

describe('isLaunchedByVitePlus', () => {
  afterEach(() => {
    delete process.env.VP_USER_AGENT
  })

  it('is true when VP_USER_AGENT is set by `vp create`', () => {
    process.env.VP_USER_AGENT = 'vite-plus/1.6.0'
    expect(isLaunchedByVitePlus()).toBe(true)
  })

  it('is false otherwise', () => {
    delete process.env.VP_USER_AGENT
    expect(isLaunchedByVitePlus()).toBe(false)
  })
})

describe('isVitePlusInstalled', () => {
  afterEach(() => {
    delete process.env.VP_HOME
  })

  it('finds the vp binary under VP_HOME', () => {
    const vpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'create-vue-vp-'))
    const binDir = path.join(vpHome, 'bin')
    fs.mkdirSync(binDir, { recursive: true })
    fs.writeFileSync(path.join(binDir, process.platform === 'win32' ? 'vp.cmd' : 'vp'), '')
    process.env.VP_HOME = vpHome

    expect(isVitePlusInstalled()).toBe(true)

    fs.rmSync(vpHome, { recursive: true, force: true })
  })
})
