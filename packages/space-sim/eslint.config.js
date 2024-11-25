import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'


const paths = ['./src']

export default tseslint.config(
    { ignores: ['dist', 'attic'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx']
            },
            'import/resolver': {
                node: {
                    paths: paths,
                    extensions: ['.js', '.jsx', '.ts', '.d.ts', '.tsx'],
                },
                typescript: {
                    alwaysTryTypes: true,
                    project: ['./tsconfig.json']
                },
            }
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/prefer-const": "off",
            "@typescript-eslint/no-explicit-any": "off",
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
        },
    },
)
