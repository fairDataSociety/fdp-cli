module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    project: './tsconfig.test.json',
  },
  env: {
    jest: true,
  },
  globals: {
    browser: true,
    page: true,
  },
  plugins: ['jest', 'unused-imports'],
  rules: {
    'array-bracket-newline': ['error', 'consistent'],
    strict: ['error', 'safe'],
    'block-scoped-var': 'error',
    complexity: 'warn',
    'default-case': 'error',
    'dot-notation': 'warn',
    eqeqeq: 'error',
    'guard-for-in': 'warn',
    'linebreak-style': ['warn', 'unix'],
    'no-alert': 'error',
    'no-case-declarations': 'error',
    'no-console': 'error',
    'no-constant-condition': 'error',
    'no-continue': 'warn',
    'no-div-regex': 'error',
    'no-empty': 'warn',
    'no-empty-pattern': 'error',
    'no-implicit-coercion': 'error',
    'prefer-arrow-callback': 'warn',
    'no-labels': 'error',
    'no-loop-func': 'error',
    'no-nested-ternary': 'warn',
    'no-script-url': 'error',
    'no-warning-comments': 'warn',
    'quote-props': ['error', 'as-needed'],
    'require-yield': 'error',
    'max-nested-callbacks': ['error', 4],
    'max-depth': ['error', 4],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'if' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: '*', next: 'return' },
    ],
    'no-useless-constructor': 'off',
    'no-dupe-class-members': 'off',
    'no-unused-expressions': 'off',
    curly: ['error', 'multi-line'],
    'object-curly-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    // necessary to disable the base rule as it can report incorrect errors
    'require-await': 'off',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/await-thenable': 'error',
  },
  overrides: [
    {
      files: ['*.spec.ts'],
      rules: {
        'max-nested-callbacks': ['error', 10], // allow to describe/it nesting
      },
    },
  ],
}
