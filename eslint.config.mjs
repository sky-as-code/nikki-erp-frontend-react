import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import parserTs from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';


export default defineConfig([
	// Base configurations
	js.configs.recommended,
	tseslint.configs.recommended,

	// Common rules for all files
	{
		rules: {
			'max-lines-per-function': [
				'warn',
				{
					max: 50,
					skipBlankLines: true,
					skipComments: true,
					IIFEs: true,
				},
			],
		},
	},

	// Stylistic rules
	stylistic.configs['disable-legacy'],
	{
		plugins: { '@stylistic': stylistic },
		rules: {
			'@stylistic/brace-style': [
				'error',
				'stroustrup',
				{ allowSingleLine: true },
			],
			'@stylistic/comma-dangle': ['warn', 'always-multiline'],
			'@stylistic/comma-spacing': ['error', { before: false, after: true }],
			'@stylistic/comma-style': ['error', 'last'],
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/jsx-quotes': ['error', 'prefer-single'],
			'@stylistic/max-len': [
				'error',
				{
					code: 120,
					tabWidth: 4,
					ignoreUrls: true,
					ignoreComments: true,
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
					ignoreRegExpLiterals: true,
				},
			],
			'@stylistic/no-mixed-spaces-and-tabs': 'error',
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/quotes': [
				'error',
				'single',
				{
					avoidEscape: true,
					allowTemplateLiterals: 'always',
				},
			],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/space-infix-ops': ['error', { int32Hint: true }],
		},
	},

	// TypeScript language
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
		languageOptions: {
			parser: parserTs,
			parserOptions: {
				project: ['./tsconfig.json'],
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { 'varsIgnorePattern': '^_', 'argsIgnorePattern': '^_' }],
		},
	},

	// React configurations
	{
		...react.configs.flat.recommended,
		files: ['**/*.jsx', '**/*.tsx'],
		settings: { react: { version: 'detect' } },
		rules: {
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'react/no-unknown-property': 'off',
			'react/jsx-no-target-blank': 'off',
			'react/jsx-indent': ['error', 'tab'],
			'react/jsx-indent-props': ['error', 'tab'],
			'max-lines-per-function': [
				'warn',
				{
					max: 80,
					skipBlankLines: true,
					skipComments: true,
					IIFEs: true,
				},
			],
		},
	},

	// Import plugin configuration
	{
		plugins: { import: importPlugin },
		rules: {
			'import/no-anonymous-default-export': 'warn',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						['parent', 'sibling', 'index'],
						'object',
						'type',
					],
					pathGroups: [{
						pattern: '**/*.css',
						group: 'object',     // treat as a separate group below everything else
						position: 'after',  // place after all JS/TS imports
					}],
					pathGroupsExcludedImportTypes: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
					'newlines-between': 'always',
				},
			],
			'import/newline-after-import': ['error', { 'count': 2 }],
		},
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
			},
			'import/resolver': {
				node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
				typescript: { alwaysTryTypes: true },
			},
		},
	},

	// JSX A11y configuration
	{
		plugins: { 'jsx-a11y': jsxA11y },
		rules: {
			'jsx-a11y/alt-text': [
				'warn',
				{
					elements: ['img'],
					img: ['Image'],
				},
			],
			'jsx-a11y/aria-props': 'warn',
			'jsx-a11y/aria-proptypes': 'warn',
			'jsx-a11y/aria-unsupported-elements': 'warn',
			'jsx-a11y/role-has-required-aria-props': 'warn',
			'jsx-a11y/role-supports-aria-props': 'warn',
		},
	},

	// Global configuration
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
		},
		linterOptions: { reportUnusedDisableDirectives: true },
		settings: { react: { version: 'detect' } },
	},

	// Ignore patterns
	{
		ignores: [
			'**/node_modules/',
			'**/.next/',
			'**/dist/',
			'**/build/',
			'**/coverage/',
			'**/public/',
		],
		settings: {
			'import/resolver': { typescript: { alwaysTryTypes: true } },
		},
	},
]);
