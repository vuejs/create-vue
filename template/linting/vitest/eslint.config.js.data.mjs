export default function getData({ oldData }) {
  return {
    ...oldData,
    configs: [
      ...oldData.configs,
      {
        importer: `import pluginVitest from '@vitest/eslint-plugin'`,
        content: `
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },`,
      },
    ],
  }
}
