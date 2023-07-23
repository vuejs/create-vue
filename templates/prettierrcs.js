const defaultConfig = {
  $schema: 'https://json.schemastore.org/prettierrc',
  semi: false,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'none'
}

const airbnb = {
  $schema: 'https://json.schemastore.org/prettierrc',
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: 'lf',
  jsxSingleQuote: false,
  printWidth: 100,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false
}

const standard = {
  $schema: 'https://json.schemastore.org/prettierrc',
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  jsxSingleQuote: true,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false
}

export {
  defaultConfig as default,

  airbnb,
  standard
}
