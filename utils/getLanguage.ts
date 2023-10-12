import * as fs from 'node:fs'
import * as path from 'node:path'

interface LanguageItem {
  message: string
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
    process.env.LC_ALL ||
    process.env.LANG || // Unix maybe
    process.env.LC_CTYPE || // C libraries maybe
    process.env.LANGSPEC || // Windows maybe
    Intl.DateTimeFormat().resolvedOptions().locale || // Node.js - Internationalization support
    'en-US'

  const locale = shellLocale.split('.')[0].replace('_', '-')

  // locale might be 'C' or something else
  return locale.length < 5 ? 'en-US' : locale
}

export default function getLanguage() {
  const locale = getLocale()
  const localesRoot = path.resolve(__dirname, 'locales')
  const languageFilePath = path.resolve(localesRoot, `${locale}.json`)
  const doesLanguageExist = fs.existsSync(languageFilePath)

  const lang: Language = doesLanguageExist
    ? require(languageFilePath)
    : require(path.resolve(localesRoot, 'en-US.json'))

  return lang
}
