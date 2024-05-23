export default function getData({ oldData }) {
  const vueDevtoolsPlugin = {
    id: 'vite-plugin-vue-devtools',
    importer: "import vueDevTools from 'vite-plugin-vue-devtools'",
    initializer: 'vueDevTools()'
  }

  return {
    ...oldData,
    plugins: [...oldData.plugins, vueDevtoolsPlugin]
  }
}
