import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'
import { Language } from '../utils/getLanguage'
import { includeAllKeys, excludeKeys } from './utils'

const locales = readdirSync(resolve(__dirname, '../locales'))

describe('should include full keys', () => {
    const structure: Language = require('../schema/locale.json')
    locales.forEach((locale) => {
        it(`for ${locale}`, () => {
            expect(includeAllKeys(require(`../locales/${locale}`), structure)).toBeTruthy()
        })
    })
})

describe("shouldn't include unnecessary keys", () => {
    const structure: Language = require('../schema/locale.json')
    locales.forEach((locale) => {
        it(`for ${locale}`, () => {
            expect(excludeKeys(require(`../locales/${locale}`), structure)).toBeTruthy()
        })
    })
})