import { it, describe, expect } from 'vite-plus/test'
import { resolveNeedsTypeScript } from '../utils/resolveFeatures'

describe('resolveNeedsTypeScript', () => {
  it('should enable TypeScript for the default feature flag', () => {
    expect(resolveNeedsTypeScript({ default: true })).toBe(true)
  })

  it('should use the interactive prompt result when no TypeScript feature flag is set', () => {
    expect(resolveNeedsTypeScript({}, true)).toBe(true)
    expect(resolveNeedsTypeScript({}, false)).toBe(false)
  })
})
