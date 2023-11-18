import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'
import { Language } from '../utils/getLanguage'
import { isValid } from './utils'

const locales = readdirSync(resolve(__dirname, '../locales'))

describe('should include full keys', () => {
    const structure: Language = {
        "projectName": {
            "message": "string",
        },
        "shouldOverwrite": {
            "dirForPrompts": {
                "current": "string",
                "target": "string"
            },
            "message": "string"
        },
        "packageName": {
            "message": "string",
            "invalidMessage": "string",
        },
        "needsTypeScript": {
            "message": "string",
        },
        "needsJsx": {
            "message": "string",
        },
        "needsRouter": {
            "message": "string",
        },
        "needsPinia": {
            "message": "string",
        },
        "needsVitest": {
            "message": "string",
        },
        "needsE2eTesting": {
            "message": "string",
            "hint": "string",
            "selectOptions": {
                "negative": {
                    "title": "string",
                },
                "cypress": {
                    "title": "string",
                    "desc": "string",
                },
                "nightwatch": {
                    "title": "string",
                    "desc": "string",
                },
                "playwright": {
                    "title": "string",
                }
            }
        },
        "needsEslint": {
            "message": "string",
        },
        "needsPrettier": {
            "message": "string",
        },
        "errors": {
            "operationCancelled": "string",
        },
        "defaultToggleOptions": {
            "active": "string",
            "inactive": "string",
        },
        "infos": {
            "scaffolding": "string",
            "done": "string",
        }
    }
    locales.forEach((locale) => {
        it(`for ${locale}`, () => {
            expect(isValid(require(`../locales/${locale}`), structure)).toBeTruthy()
        })
    })
})