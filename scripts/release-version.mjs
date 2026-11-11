import semver from 'semver'

export function nextReleaseVersion(currentVersion, releasedAt) {
  const current = new semver.SemVer(currentVersion)
  const utcDate = Number(releasedAt.toISOString().slice(0, 10).replaceAll('-', ''))

  if (current.minor > utcDate) {
    throw new Error(
      `The current version ${currentVersion} is ahead of the UTC release date ${utcDate}.`,
    )
  }
  if (current.minor === utcDate) {
    // A patch bump also promotes a prerelease to its stable version.
    return current.inc('patch').version
  }
  return `${current.major}.${utcDate}.0`
}
