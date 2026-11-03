// Side-effect import, first on purpose: telemetry registers before express or node:http is loaded (BFF-01).
import './telemetry/register';
import fs from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';


import { attachHosting, createApiApp } from './app';
import { loadAppConfig, loadTelemetryConfig } from './common/config/env';
import { createContainer } from './common/ioc/container';
import { createJsonLogger } from './common/logging/logger';
import { getTelemetry } from './telemetry/provider';

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
	const { shutdownFlushMs } = loadTelemetryConfig();
	for (const signal of ['SIGINT', 'SIGTERM'] as const) {
		process.once(signal, () => shutDown(server, shutdownFlushMs));
	}
}

/** Stop accepting, drain, flush telemetry (bounded), exit; forced out after 5s whatever happens. */
function shutDown(server: BffServer, flushMs: number): void {
	server.close(() => {
		const flushed = getTelemetry()?.shutdown(flushMs) ?? Promise.resolve();
		void flushed.finally(() => process.exit(0));
	});
	// Long-lived streams (NDJSON, HMR) would otherwise keep close() waiting.
	server.closeAllConnections();
	setTimeout(() => process.exit(0), 5000).unref();
}

main().catch((err: unknown) => {
	createJsonLogger().error('Web BFF failed to start', err);
	process.exit(1);
});
