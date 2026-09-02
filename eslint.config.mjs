import { includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
});

/**
 * @see https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-formats
 * @type {import('eslint').Linter.Config[]}
 */
const eslintConfig = [
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	includeIgnoreFile(gitignorePath),
	...compat.config({
		plugins: ['@typescript-eslint', 'prettier'],
		extends: [
			'plugin:@tanstack/query/recommended',
			'plugin:@next/next/recommended',
			'next/core-web-vitals',
			'next/typescript',
			'plugin:import/recommended',
			'plugin:import/typescript',
			'plugin:prettier/recommended',
			'prettier',
		],
		ignorePatterns: ['**/components/ui/**'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'import/no-unresolved': 'off',
			'no-console': 'warn',
			'no-shadow': 'off',
			'no-unused-vars': 'off',
			'no-use-before-define': 'warn',
			'react-hooks/rules-of-hooks': 'off',
		},
	}),
];

export default eslintConfig;
