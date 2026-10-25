import type { Logger } from '../common/logging/logger';
import type { Express, RequestHandler } from 'express';
import type { Server } from 'node:net';




export type ViteDevServer = {
	middlewares: RequestHandler,
	transformIndexHtml(url: string, html: string): Promise<string>,
	ssrFixStacktrace(error: Error): void,
};

type ViteModule = {
	createServer(options: Record<string, unknown>): Promise<ViteDevServer>,
};

// Loaded lazily: vite is a dev dependency, absent from the production image.
async function importVite(): Promise<ViteModule> {
	return (await import('vite')) as unknown as ViteModule;
}

export async function initViteServer(
	app: Express, server: Server, clientRootPath: string, logger: Logger,
): Promise<ViteDevServer> {
	logger.info('Initializing Vite Server...');
	const vite = await importVite();
	const viteServer = await vite.createServer({
		root: clientRootPath,
		logLevel: 'info',
		server: {
			middlewareMode: true,
			watch: { usePolling: true, interval: 100 },
			allowedHosts: true,
			hmr: { server },
		},
		appType: 'custom',
	});
	app.use(viteServer.middlewares);
	return viteServer;
}
