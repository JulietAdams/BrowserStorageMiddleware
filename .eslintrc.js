/* eslint-disable */

module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2019,
    },
    rules: {
        indent: ['error', 2, { 'SwitchCase': 1 }],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'linebreak-style': ['error', 'unix'],
        'no-trailing-spaces': ['error'],
        'no-multi-spaces': ['error'],
        'key-spacing': ['error'],
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'space-infix-ops': ['error'],
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/member-delimiter-style': ['error', {
            'multiline': { 'delimiter': 'semi' },
            'singleline': { 'delimiter': 'comma' }
        }],
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/camelcase': 0,
    },
};