import { it, describe, expect } from 'vite-plus/test'
import applyVitePlus from '../utils/vitePlus'

function createPackageJson(): Record<string, any> {
  return {
    scripts: {
      dev: 'vite',
      build: 'vite build',
      'build-only': 'vite build',
      preview: 'vite preview',
      'test:unit': 'vitest',
      'lint:oxlint': 'oxlint . --fix',
      'lint:eslint': 'eslint . --fix --cache',
      format: 'oxfmt src/',
    },
    devDependencies: {
      eslint: '^10.13.0',
      oxfmt: '^0.75.0',
      oxlint: '~1.90.0',
      vite: '^8.3.5',
      'vite-plus': '^1.4.0',
      vitest: '^5.0.5',
    },
  }
}

describe('applyVitePlus', () => {
  it('routes all tool scripts through vp and drops bundled packages', () => {
    const pkg = createPackageJson()

    applyVitePlus(pkg, { needsVitest: true, needsEslint: true, needsOxfmt: true })

    expect(pkg.scripts).toStrictEqual({
      dev: 'vp dev',
      build: 'vp build',
      'build-only': 'vp build',
      preview: 'vp preview',
      'test:unit': 'vp test',
      'lint:oxlint': 'vp lint . --fix',
      // ESLint is not part of Vite+ and is left untouched
      'lint:eslint': 'eslint . --fix --cache',
      format: 'vp fmt src/',
    })
    expect(pkg.devDependencies).toStrictEqual({
      eslint: '^10.13.0',
      vite: '^8.3.5',
      'vite-plus': '^1.4.0',
    })
  })

  it('keeps the type-check step in the build script for TypeScript projects', () => {
    const pkg = createPackageJson()
    pkg.scripts.build = 'run-p type-check "build-only {@}" --'

    applyVitePlus(pkg, { needsTypeScript: true })

    expect(pkg.scripts.build).toBe('run-p type-check "build-only {@}" --')
    expect(pkg.scripts['build-only']).toBe('vp build')
  })

  it('only rewrites scripts for the features that were selected', () => {
    const pkg = createPackageJson()
    delete pkg.scripts['test:unit']
    delete pkg.scripts['lint:oxlint']
    delete pkg.scripts.format
    delete pkg.scripts['build-only']

    applyVitePlus(pkg, {})

    expect(pkg.scripts).toStrictEqual({
      dev: 'vp dev',
      build: 'vp build',
      preview: 'vp preview',
      'lint:eslint': 'eslint . --fix --cache',
    })
  })
})
