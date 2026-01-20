export default function getData({ oldData }) {
  return {
    ...oldData,
    configs: [
      ...oldData.configs,
      {
        importer: `import pluginOxlint from 'eslint-plugin-oxlint'`,
        content: `\n  ...pluginOxlint.configs['flat/recommended'],`,
      },
    ],
  }
}
