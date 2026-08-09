type TypeScriptFeatureFlags = {
  default?: boolean
  ts?: boolean
  typescript?: boolean
  tsgo?: boolean
}

export function resolveNeedsTypeScript(
  argv: TypeScriptFeatureFlags,
  promptedNeedsTypeScript?: boolean,
) {
  return Boolean(
    argv.default || argv.ts || argv.typescript || argv.tsgo || promptedNeedsTypeScript,
  )
}
