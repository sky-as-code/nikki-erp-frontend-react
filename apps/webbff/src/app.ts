import cors from 'cors';
import express, { type Express } from 'express';

import { CONFIG_ROUTER_PATH, createConfigRouter } from './api/v0/config_router';
import { API_PREFIX, createProxyHandler } from './common/proxy/proxy_handler';
import { createCsrfGuard } from './common/session/csrf';
import { renderIndexHtml } from './hosting/index_html';
import { initStaticServer } from './hosting/static';
import { initViteServer, type ViteDevServer } from './hosting/vite';
import { moduleRouterFactories } from './modules/index';

import type { Container } from './common/ioc/container';
import type { Server } from 'node:net';


/** Builds the API part of the app: CSRF guard, `/api/v0`, module routers, then the generic proxy. */
export function createApiApp(container: Container): Express {
	const app = express();
	app.disable('x-powered-by');
	if (container.config.corsOrigins.length > 0) {
		app.use(cors({ origin: [...container.config.corsOrigins], credentials: true }));
	}
	app.use(API_PREFIX, createCsrfGuard());
	app.use(CONFIG_ROUTER_PATH, createConfigRouter(container.config));
	registerModuleRouters(app, container);
	app.use(API_PREFIX, createProxyHandler(container));
	return app;
}

/**
 * EXTENSION POINT: mounts every router listed in `src/modules/index.ts`, before the generic proxy, so that a
 * module route (accumulation, or changed behaviour) wins over plain forwarding of the same path.
 */
export function registerModuleRouters(app: Express, container: Container): void {
	for (const factory of moduleRouterFactories) {
		const { basePath, router } = factory(container);
		app.use(basePath, router);
	}
}

/** Frontend hosting, mounted after the API: Vite middleware locally, static files otherwise, index.html last. */
export async function attachHosting(app: Express, server: Server, container: Container): Promise<void> {
	const { config, logger } = container;
	logger.info('Client Root Path:', config.clientRootPath);
	let viteServer: ViteDevServer | undefined;
	if (config.isLocal) {
		viteServer = await initViteServer(app, server, config.clientRootPath, logger);
	}
	else {
		initStaticServer(app, config.clientRootPath, logger);
	}
	app.use(renderIndexHtml({
		clientRootPath: config.clientRootPath,
		clientConfig: config.clientConfig,
		logger,
		viteServer,
	}));
}
