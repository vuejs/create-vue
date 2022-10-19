# create-vue
A complex template for creating Vue.js websites.

## Overview
This template uses Vue CLI for compatibility. It uses [vue-tsc](https://github.com/es6-shim/angular6) for type system and importing. It does not use any plugins and can be used standalone.

This template uses the [Playwright](https://github.com/playwright/playwright) JavaScript playground scaffolding library. Its `/entry/entry.js` file provides a set of examples for modifying `app.js`. It also produces `.vue` files for this template.

## Build Setup

The test server can be configured to run `npm install` to get a couple of tests: `npm test`, then `npm run lint`. The lint will generate a list of possible files in this repository that are possible to have in your ESLint project and `mint`
to ensure your files are clean and conflict-free. You can also run `lint` without `npm install`, or `npm run sinlint`.

Then, to run the test suite, use `npm install` to have both of those scripts installed on the machine the `npm test` and `npm run lint` are installed on.

## Running Tests
To test the ESLint write a single `vm-NpmModule` block in the entry directory to run tests: `lint`.

## Re-running Tests
To re-run tests which failed when re-running the browser, use `npm run linter`. This will use `eslint`, as opposed to `mint`. This is an undocumented feature.

In addition to running sprints, the test suite can be polled for changes in `App`. Use `npm run proxy`.

The scaffolding package script can also be run in a gradle
configuration. For instance, to create a full project, create a local `build` script that uses the playwright scaffold and executes the script generate-project.js
to write out the project's unit tests.
```
source: build/target/libs/generate-project.js
tree: tree(this.csips.labels)
```
, which then can be run through the Playwright playground lab, where a console output will show
you the project's code in its entirety in the playground browser.

## Running Packages
If you want to run a package, use the `npm run package` or `npm run build-create-project` script to run
a copy of the scaffold code, and `npm install` to install it.

## Running Pipelines
To run a pipeline, the scripts in the [pipeline/](pipeline/) directory can be run:
```
npm run process-build
npm run build-create-project
```

## Running Pipelines with Playwright
When running a pipeline, a system-wide playwright scaffold list will be generated and injected into the app,
  so you can use Playwright's browser-for-Playworks mechanics to watch test files change.

## Contributing
Feel free to submit pull requests here with your flags:

 * Fork the project
 * Create your feature branch (`git checkout -b my-new-feature`)
 * Commit your changes (`git commit -am 'Add some feature'`)
 * Push to the branch (`git push origin my-new-feature`)
 * Create new Pull Request
