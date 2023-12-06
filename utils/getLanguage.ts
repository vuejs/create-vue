import * as fs from 'node:fs'
import * as path from 'node:path'

interface LanguageItem {
  hint?: string
  message: string
  invalidMessage?: string
  dirForPrompts?: {
    current: string
    target: string
  }
  toggleOptions?: {
    active: string
    inactive: string
  }
  selectOptions?: {
    [key: string]: { title: string; desc?: string }
  }
}

interface Language {
  projectName: LanguageItem
  shouldOverwrite: LanguageItem
  packageName: LanguageItem
  needsTypeScript: LanguageItem
  needsJsx: LanguageItem
  needsRouter: LanguageItem
  needsPinia: LanguageItem
  needsVitest: LanguageItem
  needsE2eTesting: LanguageItem
  needsEslint: LanguageItem
  needsPrettier: LanguageItem
  errors: {
    operationCancelled: string
  }
  defaultToggleOptions: {
    active: string
    inactive: string
  }
  infos: {
    scaffolding: string
    done: string
  }
}

function getLocale() {
  const shellLocale =
    process.env.LC_ALL || // POSIX locale environment variables
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    Intl.DateTimeFormat().resolvedOptions().locale || // Built-in ECMA-402 support
    'en-US' // Default fallback

  const locale = shellLocale.split('.')[0].replace('_', '-')

  return locale
}

export default function getLanguage() {
  const locale = getLocale()

  // Note here __dirname would not be transpiled,
  // so it refers to the __dirname of the file `<repositoryRoot>/outfile.cjs`
  // TODO: use glob import once https://github.com/evanw/esbuild/issues/3320 is fixed
  const localesRoot = path.resolve(__dirname, 'locales')
  const languageFilePath = path.resolve(localesRoot, `${locale}.json`)
  const doesLanguageExist = fs.existsSync(languageFilePath)

  if (!doesLanguageExist) {
    console.warn(
      `\x1B[33mThe locale langage "${locale}" is not supported, fallback to "en-US".\n\x1B[39m`
    )
  }

  const lang: Language = doesLanguageExist
    ? require(languageFilePath)
    : require(path.resolve(localesRoot, 'en-US.json'))

  return lang
}
