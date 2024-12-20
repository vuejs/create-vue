import * as fs from 'node:fs'
import * as path from 'path'

function replaceContent(filepath: string, replacer: (content: string) => string) {
  const content = fs.readFileSync(filepath, 'utf8')
  fs.writeFileSync(filepath, replacer(content))
}

export default function trimBoilerplate(rootDir: string, features: Record<string, boolean>) {
  const isTs = features.needsTypeScript
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

  // Remove CSS import in the entry file
  const entryPath = path.resolve(rootDir, isTs ? 'src/main.ts' : 'src/main.js')
  replaceContent(entryPath, (content) => content.replace("import './assets/main.css'\n\n", ''))

  // If `router` feature is selected, use an empty router configuration
  if (features.needsRouter) {
    const routerEntry = path.resolve(srcDir, isTs ? 'router/index.ts' : 'router/index.js')
    replaceContent(routerEntry, (content) =>
      content
        .replace(`import HomeView from '../views/HomeView.vue'\n`, '')
        .replace(/routes:\s*\[[\s\S]*?\],/, 'routes: [],'),
    )
  }
}
