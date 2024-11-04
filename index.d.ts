type PluginData = {
  importer: string
  content: string
}
type AdditionalConfigItem = {
  devDependencies?: Record<string, string>
  beforeVuePlugin?: PluginData[]
  afterVuePlugin?: PluginData[]
}

export default function createConfig(options: {
  styleGuide?: 'default'
  hasTypeScript?: boolean
  needsPrettier?: boolean
  needsOxlint?: boolean
  additionalConfigs?: AdditionalConfigItem[]
}): {
  pkg: {
    scripts: Record<string, string>
    devDependencies: Record<string, string>
  }
  files: {
    'eslint.config.js': string
    '.editorconfig': string
    '.prettierrc.json'?: string
  }
}

/**
 * Recursively merge the content of the new object to the existing one
 * @param {object} target the existing object
 * @param {object} obj the new object
 */
export function deepMerge(target: object, obj: object): object
