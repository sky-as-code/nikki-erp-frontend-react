import express from 'express';

import { createResourceFormService } from './form_service';
import { sendUpstreamUnavailable, UpstreamUnavailableError } from '../../common/http/errors';

import type { ResourceFormResult, ResourceFormService, ResourceFormTarget } from './form_service';
import type { Container } from '../../common/ioc/container';
import type { ModuleRouter } from '../index';
import type { NextFunction, Request, Response } from 'express';


export const RESOURCE_FORMS_BASE_PATH = '/api/v1';

const NAME_SEGMENT = /^[a-z0-9_]+$/;
const ID_SEGMENT = /^[A-Za-z0-9_-]+$/;
/** Storage's own multipart routes are proxied as they are. */
const EXCLUDED_MODULES: ReadonlySet<string> = new Set(['itstorage']);

/**
 * `POST /api/v1/:module/:schema` and `PATCH /api/v1/:module/:schema/:id` sent as `multipart/form-data`: a resource
 * write carrying files. Part `payload` (the JSON body, with `__file_sizes`) comes first, then one part per file named
 * by its `<name>_file_id` field. Each file is streamed to Storage, its id set into the payload, and the payload sent
 * upstream as JSON. Any other request falls through to the generic proxy. No body parser is mounted.
 */
export function resourceFormsRouterFactory(
	container: Container,
	service: ResourceFormService = createResourceFormService(container.upstream, container.logger),
): ModuleRouter {
	const router = express.Router();
	const handler = async (req: Request, res: Response, next: NextFunction) => {
		const target = readTarget(container, req);
		if (!target) {
			next();
			return;
		}
		await handle(container, service, target, res);
	};
	router.post('/:module/:schema', handler);
	router.patch('/:module/:schema/:id', handler);
	return { basePath: RESOURCE_FORMS_BASE_PATH, router };
}

function readTarget(container: Container, req: Request): ResourceFormTarget | undefined {
	const { module: moduleKey, schema: schemaName, id } = req.params as Record<string, string | undefined>;
	if (!req.is('multipart/form-data') || !moduleKey || !schemaName || EXCLUDED_MODULES.has(moduleKey)) {
		return undefined;
	}
	if (!NAME_SEGMENT.test(moduleKey) || !NAME_SEGMENT.test(schemaName) || (id !== undefined && !ID_SEGMENT.test(id))) {
		return undefined;
	}
	const idPath = id === undefined ? '' : `/${encodeURIComponent(id)}`;
	return {
		method: id === undefined ? 'POST' : 'PATCH',
		upstreamPath: `/v1/${moduleKey}/${schemaName}${idPath}`,
		accessToken: container.sessionCookies.readAccessToken(req),
		incomingReq: req,
	};
}

async function handle(
	container: Container, service: ResourceFormService, target: ResourceFormTarget, res: Response,
): Promise<void> {
	const controller = new AbortController();
	res.on('close', () => !res.writableFinished && controller.abort());
	try {
		sendResult(res, await service.submit(target, controller.signal));
	}
	catch (err) {
		if (!(err instanceof UpstreamUnavailableError)) {
			throw err;
		}
		if (res.headersSent || res.destroyed) {
			return;
		}
		container.logger.warn(`Resource form ${target.method} ${target.upstreamPath} failed: ${err.message}`);
		sendUpstreamUnavailable(res);
	}
}

function sendResult(res: Response, result: ResourceFormResult): void {
	if (res.headersSent || res.destroyed) {
		return;
	}
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
