import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'
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

const locales = readdirSync(resolve(__dirname, '../locales')).filter((file) => {
  return file.endsWith('.json')
})
const defaultKeys = getKeys(en);

describe("should include all keys", () => {
  locales.forEach((locale) => {
    it.runIf(!locale.startsWith("en-US"))(`for ${locale}`, () => {
      expect(getKeys(require(`../locales/${locale}`))).toEqual(defaultKeys)
    })
  })
})