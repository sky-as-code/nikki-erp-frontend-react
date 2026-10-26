import busboy from 'busboy';

import { buildUploadBody } from './upload_body';
import { buildErrors, ERR_MALFORMED_REQUEST, ERR_UPSTREAM_UNAVAILABLE } from '../../common/http/errors';

import type { UpstreamClient } from '../../common/http/upstream_client';
import type { Logger } from '../../common/logging/logger';
import type { FileInfo } from 'busboy';
import type { IncomingMessage } from 'node:http';
import type { Readable } from 'node:stream';


export const STORAGE_UPLOAD_PATH = '/v1/itstorage/files/upload';
export const PAYLOAD_PART = 'payload';
export const FILE_SIZES_KEY = '__file_sizes';
export const FILE_FIELD = /^[a-z0-9_]+_file_id$/;
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;

/** One resource create (`POST /v1/:module/:schema`) or update (`PATCH /v1/:module/:schema/:id`). */
export interface ResourceFormTarget {
	readonly method: 'POST' | 'PATCH';
	readonly upstreamPath: string;
	readonly accessToken?: string;
	readonly incomingReq: IncomingMessage;
}

export interface ResourceFormResult {
	readonly status: number;
	readonly body: unknown;
}

export interface ResourceFormService {
	/**
	 * Uploads each file part to Storage as it streams in, sets the returned ids into `payload`, then sends the
	 * resource write as JSON. `signal` is the browser's disconnect. Rejects with `UpstreamUnavailableError`.
	 */
	submit(target: ResourceFormTarget, signal: AbortSignal): Promise<ResourceFormResult>;
}

type Deps = { readonly upstream: UpstreamClient; readonly logger: Logger };

type FormContext = {
	readonly target: ResourceFormTarget;
	/** Aborts every in-flight upload: the browser left, or one part already failed the request. */
	readonly uploadAbort: AbortController;
	readonly fileFields: Set<string>;
	readonly uploads: Array<Promise<UploadOutcome>>;
	payload?: Record<string, unknown>;
	/** The first failure; the request answers it once the browser's form is fully read. */
	failure?: ResourceFormResult;
};

type UploadOutcome = { readonly field: string; readonly id?: string };

type FilePart = { readonly field: string; readonly stream: Readable; readonly info: FileInfo };

export function createResourceFormService(upstream: UpstreamClient, logger: Logger): ResourceFormService {
	const deps: Deps = { upstream, logger };
	return { submit: (target, signal) => submit(deps, target, signal) };
}

async function submit(deps: Deps, target: ResourceFormTarget, signal: AbortSignal): Promise<ResourceFormResult> {
	const uploadAbort = new AbortController();
	const onDisconnect = () => uploadAbort.abort();
	signal.addEventListener('abort', onDisconnect, { once: true });
	try {
		const context = await readForm(deps, target, uploadAbort, signal);
		const outcomes = await Promise.all(context.uploads);
		if (context.failure) {
			return context.failure;
		}
		if (!context.payload) {
			return malformed(`The \`${PAYLOAD_PART}\` part is required`);
		}
		return await sendPayload(deps, target, withFileIds(context.payload, outcomes));
	}
	finally {
		signal.removeEventListener('abort', onDisconnect);
	}
}

/** Resolves once busboy has read the whole form, or at once when the browser disconnects. */
function readForm(
	deps: Deps, target: ResourceFormTarget, uploadAbort: AbortController, signal: AbortSignal,
): Promise<FormContext> {
	const context: FormContext = { target, uploadAbort, fileFields: new Set(), uploads: [] };
	return new Promise((resolve) => {
		const done = () => resolve(context);
		let parser: busboy.Busboy;
		try {
			parser = busboy({ headers: target.incomingReq.headers, limits: { fieldSize: MAX_PAYLOAD_BYTES } });
		}
		catch (err) {
			fail(context, malformed((err as Error).message));
			done();
			return;
		}
		parser.on('field', (name, value, info) => onField(context, name, value, info.valueTruncated));
		parser.on('file', (field, stream, info) => onFile(deps, context, { field, stream, info }));
		parser.on('close', done);
		parser.on('error', (err) => {
			fail(context, malformed((err as Error).message));
			done();
		});
		signal.addEventListener('abort', done, { once: true });
		target.incomingReq.pipe(parser);
	});
}

function onField(context: FormContext, name: string, value: string, truncated: boolean): void {
	if (name !== PAYLOAD_PART || context.payload !== undefined || context.fileFields.size > 0) {
		fail(context, malformed(`Only one \`${PAYLOAD_PART}\` text part is accepted, before every file`));
		return;
	}
	const parsed = truncated ? undefined : parseJsonObject(value);
	if (!parsed) {
		fail(context, malformed(`The \`${PAYLOAD_PART}\` part must be a JSON object`));
		return;
	}
	context.payload = parsed;
}

function onFile(deps: Deps, context: FormContext, part: FilePart): void {
	const problem = checkFilePart(context, part.field);
	if (problem) {
		fail(context, malformed(problem));
	}
	if (problem || context.failure) {
		part.stream.resume();
		return;
	}
	context.fileFields.add(part.field);
	context.uploads.push(uploadOne(deps, context, part));
}

function checkFilePart(context: FormContext, field: string): string | undefined {
	if (!context.payload) {
		return `The \`${PAYLOAD_PART}\` part must come before the files`;
	}
	if (!FILE_FIELD.test(field) || context.fileFields.has(field)) {
		return `File part \`${field}\` must be a distinct \`<name>_file_id\` field`;
	}
	if (readFileSize(context.payload, field) === undefined) {
		return `\`${FILE_SIZES_KEY}.${field}\` must give the file's size in bytes`;
	}
	return undefined;
}

async function uploadOne(deps: Deps, context: FormContext, part: FilePart): Promise<UploadOutcome> {
	const { target, payload, uploadAbort } = context;
	const orgId = typeof payload?.org_id === 'string' && payload.org_id !== '' ? payload.org_id : undefined;
	const upload = buildUploadBody(part.stream, {
		orgId,
		name: part.info.filename || part.field,
		mimeType: part.info.mimeType || 'application/octet-stream',
		sizeBytes: readFileSize(payload!, part.field)!,
	});
	try {
		const response = await deps.upstream.streamTo(upload.body, {
			upstreamPath: STORAGE_UPLOAD_PATH,
			contentType: upload.contentType,
			accessToken: target.accessToken,
			incomingReq: target.incomingReq,
			signal: uploadAbort.signal,
		});
		const id = readFileId(response.body);
		if (isSuccess(response.status) && id) {
			return { field: part.field, id };
		}
		fail(context, isSuccess(response.status) ? unexpectedUpload(deps, part.field) : response);
	}
	catch (err) {
		if (!uploadAbort.signal.aborted) {
			deps.logger.warn(`Storage upload of ${part.field} failed: ${(err as Error).message}`);
			fail(context, unavailable('The storage service is unavailable'));
		}
	}
	upload.abandon();
	return { field: part.field };
}

async function sendPayload(
	deps: Deps, target: ResourceFormTarget, payload: Record<string, unknown>,
): Promise<ResourceFormResult> {
	const response = await deps.upstream.requestJson(target.method, target.upstreamPath, {
		body: payload,
		accessToken: target.accessToken,
		incomingReq: target.incomingReq,
	});
	return { status: response.status, body: response.body };
}

function withFileIds(payload: Record<string, unknown>, outcomes: UploadOutcome[]): Record<string, unknown> {
	const body = { ...payload };
	delete body[FILE_SIZES_KEY];
	outcomes.forEach(({ field, id }) => {
		body[field] = id;
	});
	return body;
}

function fail(context: FormContext, result: ResourceFormResult): void {
	context.failure ??= { status: result.status, body: result.body };
	context.uploadAbort.abort();
}

function readFileSize(payload: Record<string, unknown>, field: string): number | undefined {
	const sizes = payload[FILE_SIZES_KEY];
	const size = typeof sizes === 'object' && sizes !== null ? (sizes as Record<string, unknown>)[field] : undefined;
	return typeof size === 'number' && Number.isSafeInteger(size) && size >= 0 ? size : undefined;
}

function readFileId(body: unknown): string | undefined {
	const id = typeof body === 'object' && body !== null ? (body as Record<string, unknown>).id : undefined;
	return typeof id === 'string' && id !== '' ? id : undefined;
}

function parseJsonObject(text: string): Record<string, unknown> | undefined {
	try {
		const value: unknown = JSON.parse(text);
		return typeof value === 'object' && value !== null && !Array.isArray(value)
			? value as Record<string, unknown>
			: undefined;
	}
	catch {
		return undefined;
	}
}

function isSuccess(status: number): boolean {
	return status >= 200 && status < 300;
}

function unexpectedUpload(deps: Deps, field: string): ResourceFormResult {
	deps.logger.warn(`Storage upload of ${field} answered without a file id`);
	return unavailable('The storage service gave an unexpected answer');
}

function malformed(message: string): ResourceFormResult {
	return { status: 400, body: buildErrors('validation', ERR_MALFORMED_REQUEST, message) };
}

function unavailable(message: string): ResourceFormResult {
	return { status: 502, body: buildErrors('business', ERR_UPSTREAM_UNAVAILABLE, message) };
}
