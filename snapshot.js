import templateList from './utils/templateList.js'
import { spawnSync } from 'child_process'

for (const template of templateList) {
  spawnSync('node', [
    new URL('./index.js', import.meta.url).pathname,
    template,
    '--template',
    template
  ], {
    cwd: new URL('./playground/', import.meta.url).pathname
  })
}
