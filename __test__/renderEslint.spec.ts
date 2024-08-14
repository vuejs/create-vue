import { it, describe, expect } from 'vitest'
import { getAdditionalConfigAndDependencies } from '../utils/renderEslint'

describe('renderEslint', () => {
  it('should get additional dependencies and config with no test flags', () => {
    const { additionalConfig, additionalDependencies } = getAdditionalConfigAndDependencies({
      needsCypress: false,
      needsCypressCT: false,
      needsPlaywright: false
    })
    expect(additionalConfig).toStrictEqual({})
    expect(additionalDependencies).toStrictEqual({})
  })

  it('should get additional dependencies and config with for cypress', () => {
    const { additionalConfig, additionalDependencies } = getAdditionalConfigAndDependencies({
      needsCypress: true,
      needsCypressCT: false,
      needsPlaywright: false
    })
    expect(additionalConfig.overrides[0].files).toStrictEqual([
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts,jsx,tsx}'
    ])
    expect(additionalConfig.overrides[0].extends).toStrictEqual(['plugin:cypress/recommended'])
    expect(additionalDependencies['eslint-plugin-cypress']).not.toBeUndefined()
  })

  it('should get additional dependencies and config with for cypress with component testing', () => {
    const { additionalConfig, additionalDependencies } = getAdditionalConfigAndDependencies({
      needsCypress: true,
      needsCypressCT: true,
      needsPlaywright: false
    })
    expect(additionalConfig.overrides[0].files).toStrictEqual([
      '**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts,jsx,tsx}'
    ])
    expect(additionalConfig.overrides[0].extends).toStrictEqual(['plugin:cypress/recommended'])
    expect(additionalDependencies['eslint-plugin-cypress']).not.toBeUndefined()
  })

  it('should get additional dependencies and config with for playwright', () => {
    const { additionalConfig, additionalDependencies } = getAdditionalConfigAndDependencies({
      needsCypress: false,
      needsCypressCT: false,
      needsPlaywright: true
    })
    expect(additionalConfig.overrides[0].files).toStrictEqual([
      'e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ])
    expect(additionalConfig.overrides[0].extends).toStrictEqual(['plugin:playwright/recommended'])
    expect(additionalDependencies['eslint-plugin-playwright']).not.toBeUndefined()
  })
})
