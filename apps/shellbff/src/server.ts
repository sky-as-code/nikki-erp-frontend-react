import * as fs from 'node:fs/promises';
import * as http from 'node:http';
import * as https from 'node:https';
import * as net from 'node:net';
import * as path from 'node:path';

import compression from 'compression';
import cors from 'cors';
import express, { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { router } from './api';
import * as config from './config';


type ViteDevServer = {
	middlewares: RequestHandler;
	transformIndexHtml(url: string, html: string): Promise<string>;
	ssrFixStacktrace(error: Error): void;
};

type ViteModule = {
	createServer(options: Record<string, unknown>): Promise<ViteDevServer>;
};

let viteModule: ViteModule | undefined;

async function getViteModule(): Promise<ViteModule> {
	if (!viteModule) {
		viteModule = (await import('vite')) as unknown as ViteModule;
	}
	return viteModule;
}


(async () => {
	let port: string;
	let protocol: string;
	const isHttpsEnabled = config.getBffConfig('HTTPS_ENABLED') === 'true';
	const app = express();
	const server = await createServer(app, isHttpsEnabled);

	if (isHttpsEnabled) {
		port = config.mustGetBffConfig('HTTPS_PORT');
		protocol = 'https';
	}
	else {
		port = config.mustGetBffConfig('HTTP_PORT');
		protocol = 'http';
	}

	const host = config.getBffConfig('HTTP_HOST');
	const bindAddress = host ? `${host}:${port}` : port;

	server.listen(bindAddress, () => {
		console.log(`Shell BFF Server running on ${protocol}://${host || 'localhost'}:${port}`);
	});
})();

async function createServer(app: Express, isHttpsEnabled: boolean): Promise<net.Server> {
	console.log('Client Root Path:', config.clientRootPath);

	let server: net.Server;
	if (isHttpsEnabled) {
		const httpsCert = await config.mustReadFileVar('HTTPS_CERTIFICATE_FILE');
		const httpsKey = await config.mustReadFileVar('HTTPS_PRIVATE_KEY_FILE');
		server = https.createServer({ key: httpsKey, cert: httpsCert }, app);
	}
	else {
		server = http.createServer(app);
	}

	// CORS middleware - allow all origins
	app.use(cors());

	app.use('/api/config', router);

	let viteServer: ViteDevServer | undefined;
	if (config.isLocal) {
		viteServer = await initViteServer(app, server);
	}
	else {
		initStaticServer(app);
	}

	app.use(renderIndexHtml(viteServer));

	return server;
};

async function initViteServer(app: Express, server: net.Server): Promise<ViteDevServer> {
	console.log('Initializing Vite Server...');

	const vite = await getViteModule();
	const viteServer: any = await vite.createServer({
		root: config.clientRootPath,
		logLevel: 'info',
		server: {
			middlewareMode: true,
			watch: {
				usePolling: true,
				interval: 100,
			},
			allowedHosts: true,
			hmr: { server },
		},
		appType: 'custom',
	});

	app.use(viteServer.middlewares);

	return viteServer;
}

function initStaticServer(app: Express): void {
	console.log('Initializing Static Server...');
	app.use(compression() as RequestHandler);
	app.use(
		express.static(config.clientRootPath, {
			// Disable directory listing
			index: false,
		}),
	);
}

function renderIndexHtml(viteServer: ViteDevServer | undefined) {
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

async function renderWithVite(req: Request, res: Response, viteServer: ViteDevServer) {
	const url = req.originalUrl;
	const html = await readIndexHtml();

	// Apply Vite transforms (inject HMR client, rewrite imports, etc.)
	const transformedHtml = await viteServer.transformIndexHtml(url, html);

	res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
}

async function readIndexHtml(): Promise<string> {
	// Read raw index.html
	const html = await fs.readFile(
		path.join(config.clientRootPath, 'index.html'),
		'utf-8',
	);

	const htmlWithConfig = injectClientConfig(html, config.clientConfig);
	return htmlWithConfig;
}

function injectClientConfig(html: string, config: Record<string, string>): string {
	if (!html.includes('$$CLIENT_CONFIG$$')) {
		console.warn('WARNING: Variable placeholder $$CLIENT_CONFIG$$ not found in index.html');
	}
	const serializedConfig = JSON.stringify(config);
	const scriptText = `window.__CLIENT_CONFIG__ = ${serializedConfig};`;
	return html.replace('$$CLIENT_CONFIG$$', scriptText);
}