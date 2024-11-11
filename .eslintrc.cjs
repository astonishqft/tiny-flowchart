/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: false // 关闭JSX语法支持
    },
    ecmaVersion: 'latest'
  },
  rules: {
    'no-undef': 0,
    'space-infix-ops': 2,
    'no-trailing-spaces': 2,
    'space-before-blocks': 2,
    'no-spaced-func': 2,
    'vue/multi-word-component-names': 0,
    semi: [2, 'never'],
    'no-prototype-builtins': 0,
    'no-multiple-empty-lines': [2, { max: 1 }],
    'arrow-parens': [2, 'as-needed'],
    'eol-last': ['error', "always"],
    'comma-dangle': ['error', {
      arrays: 'never',
      objects: 'never',
      imports: 'never',
      exports: 'never',
      functions: 'never'
    }]
  }
}
