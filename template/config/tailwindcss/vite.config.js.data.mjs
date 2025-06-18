export default function getData({ oldData }) {
  const tailwindPlugin = {
    name: 'tailwindcss',
    importer: "import tailwindcss from '@tailwindcss/vite'",
    initializer: 'tailwindcss()',
  }

  return {
    ...oldData,
    // Append the Tailwind CSS plugin right after the vue plugin
    plugins: oldData.plugins.flatMap((plugin) =>
      plugin.id === 'vue' ? [plugin, tailwindPlugin] : plugin,
    ),
  }
}
