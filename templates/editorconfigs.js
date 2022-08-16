exports.airbnb = `root = true

[*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue}]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
max_line_length = 100
trim_trailing_whitespace = true
`

// standard doesn't have an opinion on line endings
// https://github.com/standard/standard/issues/140
// or maximum line length
// https://github.com/standard/standard/issues/1559
exports.standard = `root = true

[*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue}]
charset = utf-8
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
`
