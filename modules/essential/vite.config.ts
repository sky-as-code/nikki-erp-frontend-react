/// <reference types="vitest" />

import path from 'path';

// import { terserMinifyPlugin } from '@nikkierp/ui/vite';
import tailwindcssVite from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


export default defineConfig({
	build: {
		outDir: 'dist',
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
					// else if (id.includes('src/index.tsx')) {
					// 	const moduleFolderName = path.basename(path.basename(__dirname));
					// 	return `nikkiapp-${moduleFolderName}`;
					// }
				},
			},
		},
	},
	plugins: [
		tsconfigPaths(),
		react(),
		tailwindcssVite(),
		// terserMinifyPlugin({
		// 	compress: { passes: 2 },
		// 	mangle: { toplevel: true },
		// }),
	],
	resolve: {
		alias: {
			// Tree-shaking
			'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons',
		},
	},
});
