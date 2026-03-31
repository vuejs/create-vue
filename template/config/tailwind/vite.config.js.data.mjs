export default function getData({ oldData }) {
  const tailwindPlugin = {
    id: 'tailwindcss',
    importer: "import tailwindcss from '@tailwindcss/vite'",
    initializer: 'tailwindcss()',
  }

  return {
    ...oldData,
    plugins: oldData.plugins.flatMap((plugin) =>
      plugin.id === 'vue' ? [plugin, tailwindPlugin] : [plugin],
    ),
  }
}
