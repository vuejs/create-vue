// @ts-check
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ejs from 'ejs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * ejs.renderFile is async so here we implement a sync version of it
 * @param {string} filePath
 * @param {Record<string, any>} data
 */
export default function renderEjsFile(filePath, data) {
  // By default, path.resolve, fs.readFileSync, etc. resolves paths relative to the current working directory.
  // That is undeterministic in the context of this project.
  // So we use __dirname to derteministically resolve the template file path.
  const fullPath = resolve(__dirname, filePath)
  const template = readFileSync(fullPath, 'utf8')
  return ejs.render(template, data, {})
}
