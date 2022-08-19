import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const airbnb = readFileSync(
  fileURLToPath(
    new URL('./prettierrc-airbnb.json', import.meta.url)
  ),
  'utf-8'
)
const standard = readFileSync(
  fileURLToPath(
    new URL('./prettierrc-standard.json', import.meta.url)
  ),
  'utf-8'
)

export {
  airbnb,
  standard
}
