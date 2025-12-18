export default function getData({ oldData }) {
  return {
    ...oldData,
    configs: [
      ...oldData.configs,
      {
        importer: "import pluginPlaywright from 'eslint-plugin-playwright'",
        content: `
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },`,
      },
    ],
  }
}
