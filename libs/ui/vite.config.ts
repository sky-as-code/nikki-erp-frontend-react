/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';


// Test-only configuration: the library ships as source and is bundled by the apps that consume it.
export default defineConfig({
	plugins: [
		// Service classes are annotated with TC39 decorators (`@storeService`). Oxc, the
		// default transformer, does not implement them: it passes the decorator through
		// verbatim, which Node (vitest) cannot parse ("Invalid or unexpected token").
		// Routing these files through Babel with the decorators plugin compiles them away.
		// `version: '2023-11'` is the stage-3 standard semantics the runtime `storeService`
		// is written against, not the legacy `experimentalDecorators` form.
		react({
			babel: {
				plugins: [
					['@babel/plugin-proposal-decorators', { version: '2023-11' }],
				],
			},
		}),
	],
});
