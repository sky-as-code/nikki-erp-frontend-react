/// <reference types="vitest" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


// Plain TypeScript, no React and no CSS: the React, Tailwind and icon-alias setup the UI libs use
// does not belong here, and its plugins are not dependencies of this package.
export default defineConfig({
	plugins: [
		tsconfigPaths(),
	],
	server: {
		watch: {
			exclude: ['**/routes.bak/**'],
		},
	},
});
