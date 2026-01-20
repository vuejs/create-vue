export default function getData() {
  return {
    configs: [
      {
        importer: `import pluginVue from 'eslint-plugin-vue'`,
        content: `  ...pluginVue.configs['flat/essential'],`,
      },

      {
        // skipped importer for this one because it was already there
        content: `  vueTsConfigs.recommended,`,
      },
    ],
  }
}
