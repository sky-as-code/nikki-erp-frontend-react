/// <reference types="vite/client" />
/// <reference types="vitest" />

import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


export default defineConfig({
	build: {
		outDir: 'dist',
		lib: {
			entry: path.resolve(__dirname, 'src/index.tsx'),
			// The hash is what lets the Shell cache-bust one micro-app without touching the others.
			fileName: 'nikkiapp-accounting-[hash]',
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
	],
	resolve: {
		alias: {
			'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons',
		},
	},
});
