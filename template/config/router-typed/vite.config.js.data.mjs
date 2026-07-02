export default function getData({ oldData }) {
  const vueRouterPlugin = {
    id: 'vue-router',
    importer: "import vueRouter from 'vue-router/vite'",
    initializer: 'vueRouter()',
  }

  return {
    ...oldData,
    // Prepend the vueRouter plugin before vue so that it can process route blocks
    plugins: [vueRouterPlugin, ...oldData.plugins],
  }
}
