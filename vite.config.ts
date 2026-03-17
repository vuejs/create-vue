import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*.{js,ts,vue,json}': ['vp fmt --no-error-on-unmatched-pattern', 'vp lint --fix'],
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
    ignorePatterns: ['playground/**', 'template/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
})
