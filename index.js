// This is also used in `create-vue`
export default function renderESLintConfig ({
  vueVersion, // 2 | 3 (TODO: 2.7 / vue-demi)

  language, // js | ts
  styleGuide, // default | airbnb | typescript
  needsPrettier, // true | false

  additionalConfig, // e.g. Cypress, createAliasSetting for Airbnb, etc.
  additionalDependenices // e.g. eslint-plugin-cypress
}) {
  // Modify `package.json`
  // - Remove `eslintConfig`, if any;
  // - Add necessary `devDependencies`;
  //   - `eslint`
  //   - `eslint-plugin-vue`
  //   - the chosen style guide's config package
  //   - `@rushstack/eslint-patch`
  //   - (optionally) `additionalDependencies`
  // - Add `lint` command, if not already have one.
  // Render `.eslintrc.cjs`, (optionally) with additionalConfig;
  // Render `.prettierrc.json` (or `prettier` field in `package.json`?), if needed.
  // Render `.editorconfig`.
}
