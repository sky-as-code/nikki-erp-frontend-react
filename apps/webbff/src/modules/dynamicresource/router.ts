import express from 'express';

import { createSchemaGraphService } from './schema_graph_service';
import {
	sendNotFound, sendUnauthenticated, sendUpstreamUnavailable, UpstreamUnavailableError,
} from '../../common/http/errors';
import { rawQuery, sendNoStoreResult } from '../../common/http/respond';

import type { SchemaGraphService } from './schema_graph_service';
import type { Container } from '../../common/ioc/container';
import type { ModuleRouter } from '../index';
import type { Request, Response } from 'express';


const PATH_SEGMENT = /^[a-z0-9_]+$/;

/** Generic dynamic resource engine endpoints that accumulate several upstream calls. */
export function dynamicResourceRouterFactory(
	container: Container,
	service: SchemaGraphService = createSchemaGraphService(container.upstream, container.schemaCache),
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
	// A cache hit never reaches the business service, so the session cookie is the only check left on it.
	const accessToken = container.sessionCookies.readAccessToken(req);
	if (!accessToken) {
		sendUnauthenticated(res);
		return;
	}
	try {
		const result = await service.fetchGraph({
			moduleKey,
			schemaName,
			query: rawQuery(req.originalUrl),
			accessToken,
			incomingReq: req,
		});
		// no-store towards the browser: the BFF already caches the graph for every caller, and schemas carry their own
		// etags the client keeps; a browser-cached copy would outlive the BFF's TTL and hide a schema change.
		sendNoStoreResult(res, result);
	}
	catch (err) {
		if (!(err instanceof UpstreamUnavailableError)) {
			throw err;
		}
		container.logger.warn(`Upstream schema graph ${moduleKey}/${schemaName} failed: ${err.message}`);
		sendUpstreamUnavailable(res);
	}
}
