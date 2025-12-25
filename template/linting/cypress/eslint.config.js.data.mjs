export default function getData({ oldData }) {
  return {
    ...oldData,
    configs: [
      ...oldData.configs,
      {
        importer: `import pluginCypress from 'eslint-plugin-cypress'`,
        content: `
  {
    ...pluginCypress.configs.recommended,
    files: [
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts,jsx,tsx}',
    ],
  },`,
      },
    ],
  }
}
