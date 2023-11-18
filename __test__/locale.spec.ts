import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'
import { Language } from '../utils/getLanguage'
import { includeAllKeys, excludeKeys } from './utils'

const locales = readdirSync(resolve(__dirname, '../locales')).filter((file) => {
  return file.includes('.json') // exclude unnecessary files
})

describe('should match name regex', () => {
  locales.forEach((locale) => {
      it(`for ${locale}`, () => {
        expect(locale).toMatch(/^[a-zA-Z]{2}(-[a-zA-Z]{2})*.json$/)
      })
  })
})

describe('should include full keys', () => {
  const structure: Language = require('../schema/locale.json')
  locales.forEach((locale) => {
    it(`for ${locale}`, () => {
      expect(includeAllKeys(require(`../locales/${locale}`), structure)).toBeTruthy()
    })
  })
})

describe("should not include unnecessary keys", () => {
  const structure: Language = require('../schema/locale.json')
  locales.forEach((locale) => {
    it(`for ${locale}`, () => {
      expect(excludeKeys(require(`../locales/${locale}`), structure)).toBeTruthy()
    })
  })
})
