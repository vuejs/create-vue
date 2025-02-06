export default function getData() {
  return {
    plugins: [
      {
        id: 'vue',
        importer: "import vue from '@vitejs/plugin-vue'",
        initializer: 'vue()',
      },

      {
        id: 'vite-plugin-vue-devtools',
        importer: "import vueDevTools from 'vite-plugin-vue-devtools'",
        initializer: 'vueDevTools()',
      },
    ],
  }
}
