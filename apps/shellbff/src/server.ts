import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import compression from 'compression';
import express, { Express, NextFunction, Request, Response } from 'express';
import * as vite from 'vite';

import { router } from './api';
import * as config from './config';


const isLocal = config.mustGetNodeEnv() === 'local';
const htmlDirPath = path.resolve(__dirname, '../public');
const clientRootPath = config.mustGetBffConfig('CLIENT_ROOT_PATH') || '';

(async () => {
	const server = await createServer();
	const host = config.getBffConfig('HTTP_HOST');
	const port = config.mustGetBffConfig('HTTP_PORT');
	const bindAddress = host ? `${host}:${port}` : port;
	server.listen(bindAddress, () => {
		console.log(`Shell BFF Server running on http://${host || 'localhost'}:${port}`);
	});
})();

async function createServer(): Promise<Express> {
	console.log('Client Root Path:', clientRootPath);
	const app = express();
	app.use('/api/config', router);

	let viteServer: vite.ViteDevServer | undefined;
	if (isLocal) {
		viteServer = await initViteServer(app);
	}
	else {
		initStaticServer(app);
	}

	app.use(renderIndexHtml(viteServer));

	return app;
};

async function initViteServer(app: Express): Promise<vite.ViteDevServer> {
	console.log('Initializing Vite Server...');
	const viteServer = await vite.createServer({
		root: clientRootPath,
		logLevel: 'info',
		server: {
			middlewareMode: true,
			watch: {
				usePolling: true,
				interval: 100,
			},
		},
		appType: 'custom',
	});

	app.use(viteServer.middlewares);
	return viteServer;
}

function initStaticServer(app: Express): void {
	console.log('Initializing Static Server...');
	app.use(compression());
	app.use(
		express.static(clientRootPath, {
			// Disable directory listing
			index: false,
		}),
	);
}

function renderIndexHtml(viteServer: vite.ViteDevServer | undefined) {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (!viteServer) {
			// For static server, also inject clientConfig
			const html = await readIndexHtml();
			res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
			return;
		}
		try {
			await renderWithVite(req, res, viteServer);
			next();
		}
		catch (err) {
			viteServer?.ssrFixStacktrace(err as Error);
			next(err);
		}
	};
}

async function renderWithVite(req: Request, res: Response, viteServer: vite.ViteDevServer) {
	const url = req.originalUrl;
	const html = await readIndexHtml();

	// Apply Vite transforms (inject HMR client, rewrite imports, etc.)
	const transformedHtml = await viteServer.transformIndexHtml(url, html);

	res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
}

async function readIndexHtml(): Promise<string> {
	// Read raw index.html
	const html = await fs.readFile(
		path.join(htmlDirPath, 'index.html'),
		'utf-8',
	);

	const htmlWithConfig = injectClientConfig(html, config.clientConfig);
	return htmlWithConfig;
}

function injectClientConfig(html: string, config: Record<string, string>): string {
	const serializedConfig = JSON.stringify(config);
	const scriptText = `window.__CLIENT_CONFIG__ = ${serializedConfig};`;
	return html.replace('$$CLIENT_CONFIG$$', scriptText);
}