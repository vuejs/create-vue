# `create-vue` Contributing Guide

Hi! We are really excited that you are interested in contributing to `create-vue`. Before submitting your contribution, please make sure to take a moment and read through the following guide:

## Repo Setup

This repo uses [Git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to store snapshots of the created templates after each release. So when cloning the repository, please make sure you have also initialized the submodules.

To download everything including submodules, run the following command:

```sh
git clone --recursive https://github.com/vuejs/create-vue.git
```

If you have already cloned the repo but without adding the `--recursive` flag, please run `git submodule update --init --recursive` to initialize and update the submodule.

This repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

## Pull Request Guidelines

- Checkout a topic branch from a base branch, e.g. `main`, and merge back against that branch.
- For any non-trivial new features or bug fixes, please open an issue first and have it approved before working on it.
- Don't include the `playground` directory in the commits. It will be updated automatically after each release.
