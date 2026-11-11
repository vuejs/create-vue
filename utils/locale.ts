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

interface Messages {
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
  needsExperimental: LanguageItem
  needsExperimentalFeatures: LanguageItem
  needsVueRc: LanguageItem
  needsTsgo: LanguageItem
  needsOxfmt: LanguageItem
  needsBareboneTemplates: LanguageItem
  packageManagerSelection: LanguageItem
  errors: {
    operationCancelled: string
  }
  warnings: {
    tsgoNubReleaseAge: string
  }
  defaultToggleOptions: {
    active: string
    inactive: string
  }
  infos: {
    updated: string
    scaffolding: string
    done: string
    optionalGitCommand: string
  }
}

const fallbackLocale = 'en-US'

export function detectLocale() {
  const shellLocale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG
  try {
    if (!shellLocale) {
      return Intl.DateTimeFormat().resolvedOptions().locale || fallbackLocale
    }

    const locale = shellLocale.split('.')[0].replace('_', '-')
    // The POSIX C locale has no matching Intl language tag.
    if (locale === 'C') return fallbackLocale
    return Intl.getCanonicalLocales(locale)[0] || fallbackLocale
  } catch (error) {
    if (shellLocale && error instanceof RangeError) {
      console.log(`${error.toString()}, invalid language tag: "${shellLocale}"\n`)
    }
    return fallbackLocale
  }
}

const regionalFallbacks: Partial<Record<string, string>> = {
  'zh-TW': 'zh-Hant',
  'zh-HK': 'zh-Hant',
  'zh-MO': 'zh-Hant',
  'zh-CN': 'zh-Hans',
  'zh-SG': 'zh-Hans',
}

function resolveMessagesFile(localesRoot: string, locale: string) {
  const regionalFallback = regionalFallbacks[locale]
  const candidates = regionalFallback ? [locale, regionalFallback] : [locale]
  for (const candidate of candidates) {
    const file = path.resolve(localesRoot, `${candidate}.json`)
    if (fs.existsSync(file)) return file
  }
  return path.resolve(localesRoot, `${fallbackLocale}.json`)
}

export async function loadMessages(localesRoot: string, locale: string): Promise<Messages> {
  const messagesFile = resolveMessagesFile(localesRoot, locale)
  return JSON.parse(await fs.promises.readFile(messagesFile, 'utf-8'))
}
