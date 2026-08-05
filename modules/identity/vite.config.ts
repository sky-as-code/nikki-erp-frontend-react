/// <reference types="vitest" />

import path from 'path';

import tailwindcssVite from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


export default defineConfig({
	// Slice names come from `ServiceClass.name`, which minification would otherwise
	// mangle — two services could collapse to the same name and share state.
	// Vite 8 transforms with oxc, so the esbuild option of the same name is ignored.
	oxc: {
		keepNames: true,
	},
	build: {
		outDir: 'dist',
		// The transform-stage keepNames above does not reach the minifier, which is what
		// actually renames the classes.
		minify: { compress: true, mangle: { keepNames: true } },
		lib: {
			entry: path.resolve(__dirname, 'src/index.tsx'),
			fileName: 'nikkiapp-essential-[hash]',
			formats: ['es'],
		},
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('react')) return 'vendor-react';
						if (id.includes('@mantine')) return 'vendor-mantine';
						if (id.includes('@tabler')) return 'vendor-icons';
						return 'vendor';
					}
				},
			},
		},
	},
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
