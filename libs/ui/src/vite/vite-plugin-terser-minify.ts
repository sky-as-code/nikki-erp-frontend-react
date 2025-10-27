/* eslint-disable max-lines-per-function */
import { minify } from 'terser';

import type { Plugin } from 'vite';


export interface TerserMinifyOptions {
	compress?: boolean | Record<string, any>
	mangle?: boolean | Record<string, any>
	format?: Record<string, any>
}

export function terserMinifyPlugin(options: TerserMinifyOptions = {}): Plugin {
	return {
		name: 'vite:terser-minify',
		apply: 'build',

		async generateBundle(_, bundle) {
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
					const result = await minify(chunk.code, {
						compress: {
							passes: 3,
							drop_console: true,
							drop_debugger: true,
							...(options.compress ?? {}) as any,
						},
						mangle: {
							toplevel: true,
							...(options.mangle ?? {}) as any,
						},
						format: {
							comments: false,
							...(options.format ?? {}),
						},
					});

					if (result.code) {
						chunk.code = result.code;
					}
				}
			}
		},
	};
}
