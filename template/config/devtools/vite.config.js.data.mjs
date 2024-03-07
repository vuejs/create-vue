export default function getData({ oldData }) {
  const vueDevtoolsPlugin = {
    id: 'vite-plugin-vue-devtools',
    importer: "import VueDevTools from 'vite-plugin-vue-devtools'",
    initializer: 'VueDevTools()'
  }

  return {
    ...oldData,
    plugins: [...oldData.plugins, vueDevtoolsPlugin]
  }
}
