import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'
import { Language } from '../utils/getLanguage'
import { includeAllKeys, excludeKeys } from './utils'

const locales = readdirSync(resolve(__dirname, '../locales')).filter((file) => {
  return file.includes('.json') // exclude unnecessary files
})

describe('should match name regex', () => {
  /**
   * 
   * both can match normal locale or reusable locale
   * 
   * @example normal locale: en-US
   * @example reusable locale: zh-Hant
   */
  const regex = /^[a-zA-Z]{2}(-[a-zA-Z]{2})*.json$|^[a-zA-Z]{2}(-[a-zA-z]{4})*.json$/
  locales.forEach((locale) => {
    it(`for ${locale}`, () => {
      expect(locale).toMatch(regex)
    })
  })
})

describe('should include full keys', () => {
  const structure = require('../schema/locale.json') as Language
  locales.forEach((locale) => {
    it(`for ${locale}`, () => {
      expect(includeAllKeys(require(`../locales/${locale}`), structure)).toBeTruthy()
    })
  })
})

describe("should not include unnecessary keys", () => {
  const structure = require('../schema/locale.json') as Language
  locales.forEach((locale) => {
    it(`for ${locale}`, () => {
      expect(excludeKeys(require(`../locales/${locale}`), structure)).toBeTruthy()
    })
  })
})
