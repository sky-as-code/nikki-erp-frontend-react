/// <reference types="vitest" />

import tailwindcssVite from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


export default defineConfig({
	plugins: [
		tsconfigPaths(),
		react(),
		tailwindcssVite(),
	],
	resolve: {
		alias: {
			// Tree-shaking
			'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons',
		},
	},
});
