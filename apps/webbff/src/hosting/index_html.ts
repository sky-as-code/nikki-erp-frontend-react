import fs from 'node:fs/promises';
import path from 'node:path';

import type { ViteDevServer } from './vite';
import type { Logger } from '../common/logging/logger';
import type { NextFunction, Request, RequestHandler, Response } from 'express';



const CONFIG_PLACEHOLDER = '$$CLIENT_CONFIG$$';

export interface IndexHtmlOptions {
	readonly clientRootPath: string;
	readonly clientConfig: Readonly<Record<string, string>>;
	readonly logger: Logger;
	readonly viteServer?: ViteDevServer;
}

/** SPA fallback: every unmatched request gets `index.html` with the public config injected. */
export function renderIndexHtml(options: IndexHtmlOptions): RequestHandler {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			let html = await readIndexHtml(options);
			if (options.viteServer) {
				html = await options.viteServer.transformIndexHtml(req.originalUrl, html);
			}
			res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
		}
		catch (err) {
			options.viteServer?.ssrFixStacktrace(err as Error);
			next(err);
		}
	};
}

async function readIndexHtml(options: IndexHtmlOptions): Promise<string> {
	const html = await fs.readFile(path.join(options.clientRootPath, 'index.html'), 'utf-8');
	if (!html.includes(CONFIG_PLACEHOLDER)) {
		options.logger.warn(`WARNING: Variable placeholder ${CONFIG_PLACEHOLDER} not found in index.html`);
	}
	return injectClientConfig(html, options.clientConfig);
}

export function injectClientConfig(html: string, config: Readonly<Record<string, string>>): string {
	// Escaping `<` keeps a config value from closing the surrounding <script> element.
	const serializedConfig = JSON.stringify(config).replace(/</g, '\u003c');
	return html.replace(CONFIG_PLACEHOLDER, () => `window.__CLIENT_CONFIG__ = ${serializedConfig};`);
}
