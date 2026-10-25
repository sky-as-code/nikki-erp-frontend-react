import compression from 'compression';
import express, { type Express, type RequestHandler } from 'express';

import type { Logger } from '../common/logging/logger';


export function initStaticServer(app: Express, clientRootPath: string, logger: Logger): void {
	logger.info('Initializing Static Server...');
	app.use(compression() as RequestHandler);
	app.use(express.static(clientRootPath, { index: false }));
}
