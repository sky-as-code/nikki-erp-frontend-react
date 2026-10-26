import { buildErrors, ERR_UPSTREAM_UNAVAILABLE } from '../../common/http/errors';

import type { UpstreamClient } from '../../common/http/upstream_client';
import type { Logger } from '../../common/logging/logger';
import type { IncomingMessage } from 'node:http';


export const STORAGE_UPLOAD_PATH = '/v1/itstorage/files/upload';
export const STORAGE_FILES_PATH = '/v1/itstorage/files';

/** One `<field>_file_path` of one resource record, as addressed by the browser. */
export interface FileFieldTarget {
	readonly moduleKey: string;
	readonly schemaName: string;
	readonly id: string;
	/** The field's base name; the resource column is `<field>_file_path`. */
	readonly field: string;
	readonly etag: string;
	readonly orgId?: string;
	readonly accessToken?: string;
	readonly incomingReq: IncomingMessage;
}

export interface FileFieldResult {
	readonly status: number;
	readonly body: unknown;
}

export interface FileFieldService {
	/** Streams the browser's multipart to Storage, then points the record's field at the new file. */
	attach(target: FileFieldTarget, signal?: AbortSignal): Promise<FileFieldResult>;
	/** Sets the record's field to null; the backend deletes the old file after commit. */
	clear(target: FileFieldTarget): Promise<FileFieldResult>;
}

type UploadedFile = { readonly id: string; readonly filePath: string };

export function createFileFieldService(upstream: UpstreamClient, logger: Logger): FileFieldService {
	return {
		attach: (target, signal) => attach(upstream, logger, target, signal),
		clear: (target) => updateFilePath(upstream, target, null),
	};
}

async function attach(
	upstream: UpstreamClient, logger: Logger, target: FileFieldTarget, signal?: AbortSignal,
): Promise<FileFieldResult> {
	const upload = await upstream.pipeTo(target.incomingReq, {
		method: 'POST',
		upstreamPath: STORAGE_UPLOAD_PATH,
		accessToken: target.accessToken,
		signal,
	});
	if (!isSuccess(upload.status)) {
		return { status: upload.status, body: upload.body };
	}
	const uploaded = readUploadedFile(upload.body);
	if (!uploaded) {
		logger.warn(`Storage upload for ${target.schemaName}/${target.id} answered without a file id and path`);
		return unavailable();
	}
	try {
		const update = await updateFilePath(upstream, target, uploaded.filePath);
		if (!isSuccess(update.status)) {
			await rollBackUpload(upstream, logger, target, uploaded.id);
		}
		return update;
	}
	catch (err) {
		await rollBackUpload(upstream, logger, target, uploaded.id);
		throw err;
	}
}

async function updateFilePath(
	upstream: UpstreamClient, target: FileFieldTarget, filePath: string | null,
): Promise<FileFieldResult> {
	const body: Record<string, unknown> = { [`${target.field}_file_path`]: filePath, etag: target.etag };
	if (target.orgId) {
		body.org_id = target.orgId;
	}
	// The resource engine's JSON update is PATCH (`ActionTypeUpdatePatch`); PUT would be a full replace.
	const path = `/v1/${target.moduleKey}/${target.schemaName}/${encodeURIComponent(target.id)}`;
	const response = await upstream.requestJson('PATCH', path, {
		body,
		accessToken: target.accessToken,
		incomingReq: target.incomingReq,
	});
	return { status: response.status, body: response.body };
}

// Best effort: a failed rollback leaves an unreferenced file, which only costs quota.
async function rollBackUpload(
	upstream: UpstreamClient, logger: Logger, target: FileFieldTarget, fileId: string,
): Promise<void> {
	const query = target.orgId ? `?org_id=${encodeURIComponent(target.orgId)}` : '';
	const path = `${STORAGE_FILES_PATH}/${encodeURIComponent(fileId)}${query}`;
	try {
		const response = await upstream.requestJson('DELETE', path, {
			accessToken: target.accessToken,
			incomingReq: target.incomingReq,
		});
		if (!isSuccess(response.status)) {
			logger.warn(`Rollback of storage file ${fileId} answered ${response.status}`);
		}
	}
	catch (err) {
		logger.warn(`Rollback of storage file ${fileId} failed: ${(err as Error).message}`);
	}
}

function readUploadedFile(body: unknown): UploadedFile | undefined {
	if (typeof body !== 'object' || body === null) {
		return undefined;
	}
	const { id, file_path: filePath } = body as Record<string, unknown>;
	if (typeof id !== 'string' || id === '' || typeof filePath !== 'string' || filePath === '') {
		return undefined;
	}
	return { id, filePath };
}

function isSuccess(status: number): boolean {
	return status >= 200 && status < 300;
}

function unavailable(): FileFieldResult {
	return {
		status: 502,
		body: buildErrors('business', ERR_UPSTREAM_UNAVAILABLE, 'The storage service gave an unexpected answer'),
	};
}
