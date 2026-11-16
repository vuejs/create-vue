import { describe, expect, it } from 'vite-plus/test'
import { nextReleaseVersion } from '../scripts/release-version.mjs'

describe('nextReleaseVersion', () => {
  const now = new Date('2026-11-12T08:59:59+09:00')

  it('uses the UTC date when migrating from the previous version scheme', () => {
    expect(nextReleaseVersion('3.24.0', now)).toBe('3.20261111.0')
  })

  it('increments the revision for another release on the same UTC day', () => {
    expect(nextReleaseVersion('3.20261111.9', now)).toBe('3.20261111.10')
  })

  it('resets the revision at midnight UTC and keeps the major', () => {
    const midnight = new Date('2026-11-12T09:00:00+09:00')
    expect(nextReleaseVersion('4.20261111.2', midnight)).toBe('4.20261112.0')
  })

  it.each(['3.20261111.0-beta.1', '3.20261111.0--canary'])(
    'promotes %s to its stable version on the same date',
    (prerelease) => {
      expect(nextReleaseVersion(prerelease, now)).toBe('3.20261111.0')
    },
  )

  it('rejects a UTC date earlier than the current release', () => {
    expect(() => nextReleaseVersion('3.20261112.0', now)).toThrow(/ahead of the UTC release date/)
  })
})
