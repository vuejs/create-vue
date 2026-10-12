type PackageJsonWithScripts = {
  scripts?: Record<string, string>
}

function insertScript(
  scripts: Record<string, string>,
  key: string,
  value: string,
  { after, before }: { after?: string; before?: string },
) {
  if (key in scripts) {
    return scripts
  }

  const result: Record<string, string> = {}
  let inserted = false

  for (const [scriptName, scriptValue] of Object.entries(scripts)) {
    if (!inserted && before === scriptName) {
      result[key] = value
      inserted = true
    }

    result[scriptName] = scriptValue

    if (!inserted && after === scriptName) {
      result[key] = value
      inserted = true
    }
  }

  if (!inserted) {
    result[key] = value
  }

  return result
}

export function addStandardScriptAliases<T extends PackageJsonWithScripts>(packageJson: T): T {
  if (!packageJson.scripts) {
    return packageJson
  }

  let scripts = packageJson.scripts

  if (!('start' in scripts) && scripts.dev) {
    scripts = insertScript(scripts, 'start', scripts.dev, { after: 'dev' })
  }

  if (!('test' in scripts)) {
    const aliasedTestScript = 'test:unit' in scripts ? 'test:unit' : 'test:e2e'

    if (scripts[aliasedTestScript]) {
      scripts = insertScript(scripts, 'test', scripts[aliasedTestScript], {
        before: aliasedTestScript,
      })
    }
  }

  packageJson.scripts = scripts
  return packageJson
}
