This document explains how to perform the project's maintenance tasks.

### Creating a new release

Anyone with write access to the main branch of both this repository and [create-vue-templates](https://github.com/vuejs/create-vue-templates/) can request a new release. This includes repository maintainers, repository administrators, and Vue.js organization administrators.

To do so, follow these steps:

1. Run `pnpm release` locally. The script keeps the current major and uses the UTC date for the minor version. The first release on November 11, 2026 would be `3.20261111.0`, and a second release that day would be `3.20261111.1`. The script commits the release and pushes the same version tag to both repositories. To set an exact version, run `pnpm release <version>`.
2. The release will be automatically published to npm by GitHub Actions once approved by an _administrator_.
3. Go to <https://github.com/vuejs/create-vue/releases/new> and create a new release with the tag that was just created. Describe the notable changes in the release notes.
