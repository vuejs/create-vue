export default function getData({ oldData }) {
  return {
    ...oldData,
    configs: [
      ...oldData.configs,
      {
        importer: `import skipFormatting from 'eslint-config-prettier/flat'`,
        content: `\n  skipFormatting,`,
      },
    ],
  }
}
