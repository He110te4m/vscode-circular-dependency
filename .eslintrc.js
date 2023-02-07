/**
 * @type {import('@types/eslint').Linter.Config}
 */
module.exports = {
  extends: ['@antfu'],
  rules: {
    curly: [2, 'all'],
    'spaced-comment': ['error', 'always', {
      line: {
        markers: ['#region', '#endregion', 'region', 'endregion', '/']
      }
    }],
    '@typescript-eslint/brace-style': [
      2,
      '1tbs'
    ],
    '@typescript-eslint/ban-ts-comment': 0,
    'vue/custom-event-name-casing': [
      2, 'kebab-case'
    ],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'pnpm-lock.yaml',
    '.eslintrc.js',
    'package.json',
    '.vscode',
    '*.config.js',
    'tsconfig.json',
  ],
}
