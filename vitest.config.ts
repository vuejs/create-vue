import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    include: ['__test__/**.spec.ts'],
  },
})
