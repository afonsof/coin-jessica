module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    'overrides': [
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
    },
    'plugins': [
        '@typescript-eslint',
    ],
    'rules': {
        'indent': [
            'error',
            4,
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        'semi': [
            'error',
            'never',
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        'one-var': ['error', 'never'],
        'comma-dangle' : ['error', 'always-multiline'],
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
        'max-len': ['error', { code: 150 }],
    },
}
