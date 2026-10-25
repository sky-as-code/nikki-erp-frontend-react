import express from 'express';

import { createSchemaGraphService } from './schema_graph_service';
import { sendNotFound, sendUpstreamUnavailable, UpstreamUnavailableError } from '../../common/http/errors';

import type { SchemaGraphResult, SchemaGraphService } from './schema_graph_service';
import type { Container } from '../../common/ioc/container';
import type { ModuleRouter } from '../index';
import type { Request, Response } from 'express';


const PATH_SEGMENT = /^[a-z0-9_]+$/;

/** Generic dynamic resource engine endpoints that accumulate several upstream calls. */
export function dynamicResourceRouterFactory(
	container: Container, service: SchemaGraphService = createSchemaGraphService(container.upstream),
): ModuleRouter {
	const router = express.Router();
	router.get('/:module/:schema/meta/schema_graph', (req, res) => handleSchemaGraph(container, service, req, res));
	return { basePath: '/api/v1', router };
}

async function handleSchemaGraph(
	container: Container, service: SchemaGraphService, req: Request, res: Response,
): Promise<void> {
	const moduleKey = String(req.params.module);
	const schemaName = String(req.params.schema);
	if (!PATH_SEGMENT.test(moduleKey) || !PATH_SEGMENT.test(schemaName)) {
		sendNotFound(res);
		return;
	}
	try {
		const result = await service.fetchGraph({
			moduleKey,
			schemaName,
			query: rawQuery(req.originalUrl),
			accessToken: container.sessionCookies.readAccessToken(req),
			incomingReq: req,
		});
		sendResult(res, result);
	}
	catch (err) {
		if (!(err instanceof UpstreamUnavailableError)) {
			throw err;
		}
		container.logger.warn(`Upstream schema graph ${moduleKey}/${schemaName} failed: ${err.message}`);
		sendUpstreamUnavailable(res);
	}
}

function rawQuery(originalUrl: string): string {
	const separatorIdx = originalUrl.indexOf('?');
	return separatorIdx < 0 ? '' : originalUrl.slice(separatorIdx + 1);
}

// no-store: schemas carry their own etags and the client caches them; a cached graph would hide a schema change.
function sendResult(res: Response, result: SchemaGraphResult): void {
	res.status(result.status).set('cache-control', 'no-store');
	if (result.body === undefined) {
		res.end();
		return;
	}
	if (typeof result.body === 'string') {
		res.type('text/plain').send(result.body);
		return;
	}
	res.json(result.body);
}
