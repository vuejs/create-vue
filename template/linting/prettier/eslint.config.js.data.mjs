export default function getData({ oldData }) {
  return {
    ...oldData,
    configs: [
      ...oldData.configs,
      {
        importer: `import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'`,
        content: `\n  skipFormatting,`,
      },
    ],
  }
}
