import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'
import { Language } from '../utils/getLanguage'
import { isValid } from './utils'

const locales = readdirSync(resolve(__dirname, '../locales'))

describe('should include full keys', () => {
    const structure: Language = require('../schema/locale.json')
    locales.forEach((locale) => {
        it(`for ${locale}`, () => {
            expect(isValid(require(`../locales/${locale}`), structure)).toBeTruthy()
        })
    })
})