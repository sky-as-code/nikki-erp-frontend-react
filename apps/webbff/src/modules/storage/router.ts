import express from 'express';

import { createFileFieldService } from './file_field_service';
import {
	buildErrors, ERR_MALFORMED_REQUEST, sendErrors, sendNotFound, sendUpstreamUnavailable, UpstreamUnavailableError,
} from '../../common/http/errors';

import type { FileFieldResult, FileFieldService, FileFieldTarget } from './file_field_service';
import type { Container } from '../../common/ioc/container';
import type { ModuleRouter } from '../index';
import type { Request, Response } from 'express';


export const STORAGE_BASE_PATH = '/api/v0';
export const FILE_FIELD_ROUTE = '/:module/:schema/:id/files/:field';

const NAME_SEGMENT = /^[a-z0-9_]+$/;
const ID_SEGMENT = /^[A-Za-z0-9_-]+$/;

/**
 * `POST|PUT|DELETE /api/v0/:module/:schema/:id/files/:field?etag=&org_id=`: a resource's file field.
 *
 * Upload streams the browser's multipart unparsed to Storage, so `etag` and `org_id`, which the follow-up
 * resource update needs, travel in the query string: reading them from the form would mean buffering it.
 * No body parser is mounted on these routes.
 */
export function storageRouterFactory(
	container: Container, service: FileFieldService = createFileFieldService(container.upstream, container.logger),
): ModuleRouter {
	const router = express.Router();
	const upload = (req: Request, res: Response) => handle(container, req, res, (target) => {
		const controller = new AbortController();
		res.on('close', () => !res.writableFinished && controller.abort());
		return service.attach(target, controller.signal);
	});
	router.post(FILE_FIELD_ROUTE, upload);
	router.put(FILE_FIELD_ROUTE, upload);
	router.delete(FILE_FIELD_ROUTE, (req, res) => handle(container, req, res, (target) => service.clear(target)));
	return { basePath: STORAGE_BASE_PATH, router };
}

async function handle(
	container: Container, req: Request, res: Response, run: (target: FileFieldTarget) => Promise<FileFieldResult>,
): Promise<void> {
	const target = readTarget(container, req, res);
	if (!target) {
		return;
	}
	try {
		sendResult(res, await run(target));
	}
	catch (err) {
		if (!(err instanceof UpstreamUnavailableError)) {
			throw err;
		}
		if (res.headersSent || res.destroyed) {
			return;
		}
		container.logger.warn(`File field ${target.schemaName}/${target.id}/${target.field} failed: ${err.message}`);
		sendUpstreamUnavailable(res);
	}
}

function readTarget(container: Container, req: Request, res: Response): FileFieldTarget | undefined {
	const { module: moduleKey, schema: schemaName, id, field } = req.params as Record<string, string>;
	if (![moduleKey, schemaName, field].every((part) => NAME_SEGMENT.test(part)) || !ID_SEGMENT.test(id)) {
		sendNotFound(res);
		return undefined;
	}
	const etag = readQueryString(req, 'etag');
	if (!etag) {
		sendErrors(res, 400, buildErrors('validation', ERR_MALFORMED_REQUEST, 'The etag query parameter is required'));
		return undefined;
	}
	return {
		moduleKey,
		schemaName,
		id,
		field,
		etag,
		orgId: readQueryString(req, 'org_id'),
		accessToken: container.sessionCookies.readAccessToken(req),
		incomingReq: req,
	};
}

function readQueryString(req: Request, name: string): string | undefined {
	const value = req.query[name];
	return typeof value === 'string' && value !== '' ? value : undefined;
}

function sendResult(res: Response, result: FileFieldResult): void {
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
