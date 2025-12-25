export default function getData({ oldData }) {
  return {
    ...oldData,
    configs: oldData.configs.map((c) => {
      if (!c.content.includes('pluginCypress')) {
        return c
      }

      return {
        ...c,

        // modify the files pattern to include component testing files
        content: `
  {
    ...pluginCypress.configs.recommended,
    files: [
      '**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts,jsx,tsx}',
    ],
  },`,
      }
    }),
  }
}
