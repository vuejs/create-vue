export default function getCommand(packageManager: string, scriptName: string, args?: string) {
  if (scriptName === 'install') {
    return packageManager === 'yarn' ? 'yarn' : `${packageManager} install`
  }
  if (scriptName === 'build') {
    return packageManager === 'npm' || packageManager === 'bun'
      ? `${packageManager} run build`
      : `${packageManager} build`
  }

  if (args) {
    return packageManager === 'npm'
      ? `npm run ${scriptName} -- ${args}`
      : `${packageManager} ${scriptName} ${args}`
  } else {
    return packageManager === 'npm' ? `npm run ${scriptName}` : `${packageManager} ${scriptName}`
  }
}
