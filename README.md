# create-vue

The recommended way to start a Vite-powered Vue project

<p align="center">
  <img src="https://github.com/vuejs/create-vue/blob/main/media/screenshot-cli.png?raw=true" width="800">
</p>

## Usage

```sh
npm create vue@3
```

Or, if you need to support IE11, you can create a Vue 2 project with:

```sh
npm create vue@2
```

Note that the version number (`@3` or `@2`) MUST NOT be omitted, otherwise `npm` may resolve to a cached and outdated version of the package.

## Difference from Vue CLI

- Vue CLI is based on webpack, while `create-vue` is based on [Vite](https://vitejs.dev/). Vite supports most of the configured conventions found in Vue CLI projects out of the box, and provides a significantly better development experience due to its extremely fast startup and hot-module replacement speed. Learn more about why we recommend Vite over webpack [here](https://vitejs.dev/guide/why.html).

- Unlike Vue CLI, `create-vue` itself is just a scaffolding tool: it creates a pre-configured project base on the features you choose, and delegates the rest to Vite. Projects scaffolded this way can directly leverage the [Vite plugin ecosystem](https://vitejs.dev/plugins/) which is Rollup-compatible.

## Migrating from Vue CLI

- [Vue CLI -> Vite Migration Guide from VueSchool.io](https://vueschool.io/articles/vuejs-tutorials/how-to-migrate-from-vue-cli-to-vite/)

- [Tools / Plugins that help with auto migration](https://github.com/vitejs/awesome-vite#vue-cli)
