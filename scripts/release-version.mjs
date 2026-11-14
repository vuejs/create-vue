import { increment, parse } from 'verkit'

export function nextReleaseVersion(currentVersion, releasedAt) {
  const current = parse(currentVersion)
  const utcDate = Number(releasedAt.toISOString().slice(0, 10).replaceAll('-', ''))

  if (current.minor > utcDate) {
    throw new Error(
      `The current version ${currentVersion} is ahead of the UTC release date ${utcDate}.`,
    )
  }
  if (current.minor === utcDate) {
    // A patch bump also promotes a prerelease to its stable version.
    return increment(current, 'patch')
  }
  return `${current.major}.${utcDate}.0`
}
