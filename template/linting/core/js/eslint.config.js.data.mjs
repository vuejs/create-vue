export default function getData() {
  return {
    configs: [
      {
        importer: `import js from '@eslint/js'`,
        content: `  js.configs.recommended,`,
      },

      {
        importer: `import pluginVue from 'eslint-plugin-vue'`,
        content: `  ...pluginVue.configs['flat/essential'],`,
      },
    ],
  }
}
