import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*.{js,ts,vue,json}': [
      'vp fmt --no-error-on-unmatched-pattern',
      'vp lint --fix --no-error-on-unmatched-pattern',
    ],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    printWidth: 100,
    ignorePatterns: ['pnpm-lock.yaml', 'playground', 'dist', '**/*.html'],
  },
  lint: {
    categories: {
      correctness: 'error',
    },
    rules: {
      // This type-aware rule requires strictNullChecks, but the repo sets
      // `"strict": false` in tsconfig.json (the code relies on evolving array
      // inference), so the rule cannot function here.
      'typescript/no-useless-default-assignment': 'off',
    },
    ignorePatterns: ['playground/**', 'template/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
})
