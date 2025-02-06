import * as fs from 'node:fs'
import * as path from 'path'

function replaceContent(filepath: string, replacer: (content: string) => string) {
  const content = fs.readFileSync(filepath, 'utf8')
  fs.writeFileSync(filepath, replacer(content))
}

export function trimBoilerplate(rootDir: string) {
  const srcDir = path.resolve(rootDir, 'src')

  for (const filename of fs.readdirSync(srcDir)) {
    // Keep `main.js/ts`, `router`, and `stores` directories
    // `App.vue` would be re-rendered in the next step
    if (['main.js', 'main.ts', 'router', 'stores'].includes(filename)) {
      continue
    }
    const fullpath = path.resolve(srcDir, filename)
    fs.rmSync(fullpath, { recursive: true })
  }
}

export function removeCSSImport(
  rootDir: string,
  needsTypeScript: boolean,
  needsCypressCT: boolean,
) {
  // Remove CSS import in the entry file
  const entryPath = path.resolve(rootDir, needsTypeScript ? 'src/main.ts' : 'src/main.js')
  replaceContent(entryPath, (content) => content.replace("import './assets/main.css'\n\n", ''))

  if (needsCypressCT) {
    const ctSetupPath = path.resolve(
      rootDir,
      needsTypeScript ? 'cypress/support/component.ts' : 'cypress/support/component.js',
    )
    replaceContent(ctSetupPath, (content) =>
      content.replace("import '@/assets/main.css'", "// import '@/assets/main.css'"),
    )
  }
}

export function emptyRouterConfig(rootDir: string, needsTypeScript: boolean) {
  const srcDir = path.resolve(rootDir, 'src')
  // If `router` feature is selected, use an empty router configuration
  const routerEntry = path.resolve(srcDir, needsTypeScript ? 'router/index.ts' : 'router/index.js')
  replaceContent(routerEntry, (content) =>
    content
      .replace(`import HomeView from '../views/HomeView.vue'\n`, '')
      .replace(/routes:\s*\[[\s\S]*?\],/, 'routes: [],'),
  )
}
