import { it, describe, expect } from 'vitest'
import { getAdditionalConfigs } from '../utils/renderEslint'

describe('renderEslint', () => {
  it('should get additional dependencies and config with no test flags', () => {
    const additionalConfigs = getAdditionalConfigs({
      needsTypeScript: false,
      needsVitest: false,
      needsCypress: false,
      needsCypressCT: false,
      needsPlaywright: false,
    })
    expect(additionalConfigs).toStrictEqual([])
  })

  it('should get additional dependencies and config with for vitest', () => {
    const additionalConfigs = getAdditionalConfigs({
      needsTypeScript: false,
      needsVitest: true,
      needsCypress: false,
      needsCypressCT: false,
      needsPlaywright: false,
    })
    expect(additionalConfigs).toHaveLength(1)
    const [additionalVitestConfig] = additionalConfigs
    expect(additionalVitestConfig.devDependencies['@vitest/eslint-plugin']).not.toBeUndefined()
    expect(additionalVitestConfig.afterVuePlugin).toHaveLength(1)
    const [additionalVitestPlugin] = additionalVitestConfig.afterVuePlugin!
    expect(additionalVitestPlugin.importer).toBe(`import pluginVitest from '@vitest/eslint-plugin'`)
    expect(additionalVitestPlugin.content).toContain('...pluginVitest.configs.recommended')
    expect(additionalVitestPlugin.content).toContain("files: ['src/**/__tests__/*']")
  })

  it('should get additional dependencies and config with for cypress', () => {
    const additionalConfigs = getAdditionalConfigs({
      needsTypeScript: false,
      needsVitest: false,
      needsCypress: true,
      needsCypressCT: false,
      needsPlaywright: false,
    })
    expect(additionalConfigs).toHaveLength(1)
    const [additionalCypressConfig] = additionalConfigs
    expect(additionalCypressConfig.devDependencies['eslint-plugin-cypress']).not.toBeUndefined()
    expect(additionalCypressConfig.afterVuePlugin).toHaveLength(1)
    const [additionalCypressPlugin] = additionalCypressConfig.afterVuePlugin!
    expect(additionalCypressPlugin.importer).toBe(
      "import pluginCypress from 'eslint-plugin-cypress/flat'",
    )
    expect(additionalCypressPlugin.content).toContain('...pluginCypress.configs.recommended')
    expect(additionalCypressPlugin.content).toContain(
      "'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'",
    )
    expect(additionalCypressPlugin.content).toContain("'cypress/support/**/*.{js,ts,jsx,tsx}'")
  })

  it('should get additional dependencies and config with for cypress with component testing', () => {
    const additionalConfigs = getAdditionalConfigs({
      needsTypeScript: false,
      needsVitest: false,
      needsCypress: true,
      needsCypressCT: true,
      needsPlaywright: false,
    })
    expect(additionalConfigs).toHaveLength(1)
    const [additionalCypressConfig] = additionalConfigs
    expect(additionalCypressConfig.devDependencies['eslint-plugin-cypress']).not.toBeUndefined()
    expect(additionalCypressConfig.afterVuePlugin).toHaveLength(1)
    const [additionalCypressPlugin] = additionalCypressConfig.afterVuePlugin!
    expect(additionalCypressPlugin.importer).toBe(
      "import pluginCypress from 'eslint-plugin-cypress/flat'",
    )
    expect(additionalCypressPlugin.content).toContain('...pluginCypress.configs.recommended')
    expect(additionalCypressPlugin.content).toContain("'**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}'")
    expect(additionalCypressPlugin.content).toContain(
      "'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'",
    )
    expect(additionalCypressPlugin.content).toContain("'cypress/support/**/*.{js,ts,jsx,tsx}'")
  })

  it('should get additional dependencies and config with for playwright', () => {
    const additionalConfigs = getAdditionalConfigs({
      needsTypeScript: false,
      needsVitest: false,
      needsCypress: false,
      needsCypressCT: false,
      needsPlaywright: true,
    })
    expect(additionalConfigs).toHaveLength(1)
    const [additionalPlaywrightConfig] = additionalConfigs
    expect(
      additionalPlaywrightConfig.devDependencies['eslint-plugin-playwright'],
    ).not.toBeUndefined()
    expect(additionalPlaywrightConfig.afterVuePlugin).toHaveLength(1)
    const [additionalPlaywrightPlugin] = additionalPlaywrightConfig.afterVuePlugin!
    expect(additionalPlaywrightPlugin.importer).toBe(
      "import pluginPlaywright from 'eslint-plugin-playwright'",
    )
    expect(additionalPlaywrightPlugin.content).toContain(
      "...pluginPlaywright.configs['flat/recommended']",
    )
    expect(additionalPlaywrightPlugin.content).toContain(
      "files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}']",
    )
  })
})
