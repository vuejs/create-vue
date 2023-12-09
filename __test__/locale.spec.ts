import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'
import en from '../locales/en-US.json'

function getKeys(obj: any, path = '', result: string[] = []) {
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      getKeys(obj[key], path ? `${path}.${key}` : key, result);
    } else {
      result.push(path ? `${path}.${key}` : key);
    }
  }
  return result;
}

const localesOtherThanEnglish = readdirSync(resolve(__dirname, '../locales')).filter((file) => {
  return file.endsWith('.json') && !file.startsWith('en-US')
})
const defaultKeys = getKeys(en);

describe("locale files should include all keys", () => {
  localesOtherThanEnglish.forEach((locale) => {
    it(`for ${locale}`, () => {
      expect(getKeys(JSON.parse(readFileSync(resolve(__dirname, "../locales", locale)) as unknown as string))).toEqual(defaultKeys)
    })
  })
})