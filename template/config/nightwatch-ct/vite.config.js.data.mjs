export default function getData({ oldData }) {
  return {
    ...oldData,

    plugins: oldData.plugins.map(plugin => {
      if (plugin.id !== 'nightwatch') {
        return plugin
      }

      return {
        ...plugin,
        initializer: "nightwatchPlugin({\n      renderPage: './nightwatch/index.html'\n    })"
      }
    })
  }
}
