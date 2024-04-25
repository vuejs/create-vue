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
  needsDevTools: LanguageItem
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

/**
 *
 * This function is used to link obtained locale with correct locale file in order to make locales reusable
 *
 * @param locale the obtained locale
 * @returns locale that linked with correct name
 */
function linkLocale(locale: string) {
  let linkedLocale: string
  try {
    linkedLocale = Intl.getCanonicalLocales(locale)[0]
  } catch (error) {
    console.log(`${error.toString()}\n`)
  }
  switch (linkedLocale) {
    case 'zh-TW':
    case 'zh-HK':
    case 'zh-MO':
      linkedLocale = 'zh-Hant'
      break
    case 'zh-CN':
    case 'zh-SG':
      linkedLocale = 'zh-Hans'
      break
    default:
      linkedLocale = locale
  }

  return linkedLocale
}

function getLocale() {
  const shellLocale =
    process.env.LC_ALL || // POSIX locale environment variables
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    Intl.DateTimeFormat().resolvedOptions().locale || // Built-in ECMA-402 support
    'en-US' // Default fallback

  return linkLocale(shellLocale.split('.')[0].replace('_', '-'))
}

export default function getLanguage() {
  const locale = getLocale()

  // Note here __dirname would not be transpiled,
  // so it refers to the __dirname of the file `<repositoryRoot>/outfile.cjs`
  // TODO: use glob import once https://github.com/evanw/esbuild/issues/3320 is fixed
  const localesRoot = path.resolve(__dirname, 'locales')
  const languageFilePath = path.resolve(localesRoot, `${locale}.json`)
  const doesLanguageExist = fs.existsSync(languageFilePath)

  const lang: Language = doesLanguageExist
    ? require(languageFilePath)
    : require(path.resolve(localesRoot, 'en-US.json'))

  return lang
}
