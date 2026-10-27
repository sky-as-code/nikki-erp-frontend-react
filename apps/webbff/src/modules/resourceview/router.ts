import express from 'express';

import { createResourceViewService, parseResourceViewPath } from './resource_view_service';
import {
	sendNotFound, sendUnauthenticated, sendUpstreamUnavailable, UpstreamUnavailableError,
} from '../../common/http/errors';
import { rawQuery, sendNoStoreResult } from '../../common/http/respond';
import { createSchemaGraphService } from '../dynamicresource/schema_graph_service';

import type { ResourceViewKind, ResourceViewService } from './resource_view_service';
import type { Container } from '../../common/ioc/container';
import type { ModuleRouter } from '../index';
import type { Request, Response } from 'express';


/**
 * `GET /api/v1/list/{path}` and `GET /api/v1/detail/{path}/{id}`: a search or a get-by-id of the business-service
 * resource `/v1/{path}`, with the label of every to-one edge added to `fields` and named in `edge_labels`.
 */
export function resourceViewRouterFactory(
	container: Container,
	service: ResourceViewService = createResourceViewService(
		container.upstream, createSchemaGraphService(container.upstream, container.schemaCache),
	),
): ModuleRouter {
	const router = express.Router();
	router.get('/list/*path', (req, res) => handleRead(container, service, 'list', req, res));
	router.get('/detail/*path', (req, res) => handleRead(container, service, 'detail', req, res));
	return { basePath: '/api/v1', router };
}

async function handleRead(
	container: Container, service: ResourceViewService, kind: ResourceViewKind, req: Request, res: Response,
): Promise<void> {
	const segments = req.params.path as unknown as string[];
	const target = parseResourceViewPath(kind, Array.isArray(segments) ? segments : []);
	if (!target) {
		sendNotFound(res);
		return;
	}
	// The schema graph may be a cache hit that never reaches the business service: refuse a missing session first.
	const accessToken = container.sessionCookies.readAccessToken(req);
	if (!accessToken) {
		sendUnauthenticated(res);
		return;
	}
	try {
		const query = new URLSearchParams(rawQuery(req.originalUrl));
		sendNoStoreResult(res, await service.read({ target, query, accessToken, incomingReq: req }));
	}
	catch (err) {
		if (!(err instanceof UpstreamUnavailableError)) {
			throw err;
		}
		container.logger.warn(`Upstream ${kind} ${target.segments.join('/')} failed: ${err.message}`);
		sendUpstreamUnavailable(res);
	}
}
