import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import baseConfig from '../../eslint.config.mjs';


export default defineConfig([
	...baseConfig,

	// Node-only service: stricter, auto-fixable style on top of the shared config.
	{
		files: ['**/*.ts', '**/*.mjs'],
		extends: [tseslint.configs.recommended],
		plugins: { '@stylistic': stylistic, import: importPlugin },
		languageOptions: {
			globals: { ...globals.node },
		},
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/comma-dangle': ['error', 'always-multiline'],
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
					alphabetize: { order: 'asc', caseInsensitive: true },
					'newlines-between': 'always',
				},
			],
			'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
			'no-console': 'off',
			'max-lines': ['warn', { max: 500 }],
		},
	},

	{
		ignores: ['dist/', 'node_modules/'],
	},
]);
