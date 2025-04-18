const path = require('path');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['@metamask/eslint-config-typescript', '../../.eslintrc.js'],
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.eslint.json')],
  },
  ignorePatterns: [
    '.prettierrc.js',
    '**/.eslintrc.js',
    '**/dist*/',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        // Add specific overrides if needed
        "@typescript-eslint/naming-convention": [
          "error",
          // Allow PascalCase for classes, interfaces, types, enums
          {
            "selector": "typeLike",
            "format": ["PascalCase"]
          },
          // Allow camelCase, PascalCase, UPPER_CASE for variables
          {
            "selector": "variable",
            "format": ["camelCase", "PascalCase", "UPPER_CASE"]
          },
          // Allow camelCase, PascalCase for functions
          {
            "selector": "function",
            "format": ["camelCase", "PascalCase"]
          },
          // Allow SCREAMING_SNAKE_CASE for enum members
          {
            "selector": "enumMember",
            "format": ["PascalCase", "UPPER_CASE"] // Add UPPER_CASE (alias for SCREAMING_SNAKE_CASE)
          }
        ]
      },
    },
  ],
}; 