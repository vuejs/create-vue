import { it, describe, expect } from 'vite-plus/test'
import { addStandardScriptAliases } from '../utils/packageScripts'

describe('addStandardScriptAliases', () => {
  it('adds start as an alias for dev', () => {
    expect(
      addStandardScriptAliases({
        scripts: {
          dev: 'vite',
          build: 'vite build',
        },
      }),
    ).toStrictEqual({
      scripts: {
        dev: 'vite',
        start: 'vite',
        build: 'vite build',
      },
    })
  })

  it('adds test as an alias for unit tests when unit and e2e tests exist', () => {
    expect(
      addStandardScriptAliases({
        scripts: {
          'test:unit': 'vitest',
          'test:e2e': 'playwright test',
        },
      }),
    ).toStrictEqual({
      scripts: {
        test: 'vitest',
        'test:unit': 'vitest',
        'test:e2e': 'playwright test',
      },
    })
  })

  it('adds test as an alias for e2e tests when only e2e tests exist', () => {
    expect(
      addStandardScriptAliases({
        scripts: {
          'test:e2e': 'playwright test',
        },
      }),
    ).toStrictEqual({
      scripts: {
        test: 'playwright test',
        'test:e2e': 'playwright test',
      },
    })
  })

  it('keeps existing standard scripts', () => {
    expect(
      addStandardScriptAliases({
        scripts: {
          dev: 'vite',
          start: 'custom start',
          test: 'custom test',
          'test:unit': 'vitest',
        },
      }),
    ).toStrictEqual({
      scripts: {
        dev: 'vite',
        start: 'custom start',
        test: 'custom test',
        'test:unit': 'vitest',
      },
    })
  })
})
