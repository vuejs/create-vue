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
  featureSelection: LanguageItem
  needsTypeScript: LanguageItem
  needsJsx: LanguageItem
  needsRouter: LanguageItem
  needsPinia: LanguageItem
  needsVitest: LanguageItem
  needsE2eTesting: LanguageItem
  needsEslint: LanguageItem
  needsPrettier: LanguageItem
  e2eSelection: LanguageItem & {
    selectOptions?: {
      [key: string]: { title: string; desc?: string; hintOnComponentTesting?: string }
    }
  }
  needsOxlint: LanguageItem
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
    optionalGitCommand: string
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
  // The C locale is the default system locale for POSIX systems.
  // https://docs.oracle.com/cd/E36784_01/html/E36823/glmar.html
  // https://sourceware.org/glibc/wiki/Proposals/C.UTF-8
  // It is common among containerized environments or minimal virtual environments
  // though most user-facing systems would have a more specific locale set.
  // The problem here is that the C locale is not a valid language tag for the Intl API.
  // But it is not desirable to throw an error in this case.
  // So we map it to 'en-US'.
  if (locale === 'C') {
    return 'en-US'
  }

  let linkedLocale: string
  try {
    linkedLocale = Intl.getCanonicalLocales(locale)[0]
  } catch (error) {
    console.log(`${error.toString()}, invalid language tag: "${locale}"\n`)
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
