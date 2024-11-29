This document explains how to perform the project's maintenance tasks.

### Creating a new release

Anyone with write access to the main branch of both this repository and [create-vue-templates](https://github.com/vuejs/create-vue-templates/) can request a new release. This includes repository maintainers, repository adminstrators, and Vue.js organization administrators.

To do so, follow these steps:

1. Run `pnpm version <patch|minor|major>` locally to bump the version number and create a new commit / tag. The `postversion` script will automatically push the changes to the repository.
2. The release will be automatically published to npm by GitHub Actions once approved by an *administrator*.
3. Go to <https://github.com/vuejs/create-vue/releases/new> and create a new release with the tag that was just created. Describe the notable changes in the release notes.
