import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export default readFileSync(fileURLToPath(new URL('./prettierrc-default.json', import.meta.url)))

export const airbnb = readFileSync(fileURLToPath(new URL('./prettierrc-airbnb.json', import.meta.url)))
export const standard = readFileSync(fileURLToPath(new URL('./prettierrc-standard.json', import.meta.url)))
