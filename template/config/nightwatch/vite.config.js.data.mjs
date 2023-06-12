export default function getData({ oldData }) {
  const nightwatchPlugin = {
    id: 'nightwatch',
    importer: "import nightwatchPlugin from 'vite-plugin-nightwatch'",
    initializer: 'nightwatchPlugin()'
  }

  return {
    ...oldData,
    plugins: [...oldData.plugins, nightwatchPlugin]
  }
}
