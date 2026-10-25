import fs from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';


import { attachHosting, createApiApp } from './app';
import { loadAppConfig } from './common/config/env';
import { createContainer } from './common/ioc/container';

import type { HttpServerConfig } from './common/config/types';
import type { Express } from 'express';


type BffServer = http.Server | https.Server;

async function createServer(app: Express, config: HttpServerConfig): Promise<BffServer> {
	if (!config.httpsEnabled) {
		return http.createServer(app);
	}
	const cert = await fs.readFile(config.certificateFile, 'utf8');
	const key = await fs.readFile(config.privateKeyFile, 'utf8');
	return https.createServer({ key, cert }, app);
}

async function main(): Promise<void> {
	const config = loadAppConfig();
	const container = createContainer(config);
	const app = createApiApp(container);
	const server = await createServer(app, config.http);
	await attachHosting(app, server, container);

	const { host, port, httpsEnabled } = config.http;
	const protocol = httpsEnabled ? 'https' : 'http';
	const onListening = () => container.logger.info(`Web BFF running on ${protocol}://${host || 'localhost'}:${port}`);
	if (host) {
		server.listen(Number(port), host, onListening);
	}
	else {
		server.listen(Number(port), onListening);
	}
	for (const signal of ['SIGINT', 'SIGTERM'] as const) {
		process.once(signal, () => shutDown(server));
	}
}

function shutDown(server: BffServer): void {
	server.close(() => process.exit(0));
	// Long-lived streams (NDJSON, HMR) would otherwise keep close() waiting.
	server.closeAllConnections();
	setTimeout(() => process.exit(0), 5000).unref();
}

main().catch((err: unknown) => {
	console.error('Web BFF failed to start:', err);
	process.exit(1);
});
