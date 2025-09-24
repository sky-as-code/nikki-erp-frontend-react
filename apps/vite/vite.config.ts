/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcssVite from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite'


// import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [  
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(), 
    tailwindcssVite()
  ],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@components': resolve(__dirname, 'src/components'),
      '@core': resolve(__dirname, 'src/modules/core'), 
      '@assets': resolve(__dirname, 'src/assets'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@screens': resolve(__dirname, 'src/screens'),
      '@server': resolve(__dirname, 'server'),
      '@public': resolve(__dirname, 'public'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@types': resolve(__dirname, 'types'),
      '@loaders': resolve(__dirname, 'src/loaders'),
      '@common': resolve(__dirname, 'src/common'),
		},
	},
});
