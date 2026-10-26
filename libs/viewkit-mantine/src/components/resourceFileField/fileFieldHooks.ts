import { unwrapResult } from '@nikkierp/common/request';
import React from 'react';

import type { RegisterAfterSave, SavedRecord } from '../../pages/resourceDetail/afterSave';
import type { SchemaPack } from '@nikkierp/common/dynamicModel';


/** A file staged on a detail page, applied by the page's after-save step. */
export type PendingFile = {
	file: File | null,
	removed: boolean,
	hadFile: boolean,
	orgId?: string,
};

/**
 * Registers the staged file of one file field with the page's after-save step: once the record
 * is saved, a new file is uploaded to Storage and attached (or replaces the old one) and a removal
 * clears it, through the BFF's `v0/.../:id/files/:field` route. Shared by every editor of a file field.
 */
export function useFileFieldAfterSave(
	field: string,
	registerAfterSave: RegisterAfterSave | undefined,
	schemaPack: SchemaPack | null,
	pending: PendingFile,
): void {
	const pendingRef = React.useRef<PendingFile>(pending);
	pendingRef.current = pending;

	React.useEffect(() => {
		if (!registerAfterSave || !schemaPack) {
			return undefined;
		}
		return registerAfterSave(async (saved: SavedRecord) => {
			const current = pendingRef.current;
			const orgId = (typeof saved.values.org_id === 'string' ? saved.values.org_id : undefined) ?? current.orgId;
			if (current.file) {
				const result = await schemaPack.restApi.uploadFile({
					id: saved.id,
					field,
					file: current.file,
					replace: current.hadFile,
					etag: saved.etag,
					org_id: orgId,
				});
				return unwrapResult(result)?.etag;
			}
			if (current.removed && current.hadFile) {
				const result = await schemaPack.restApi.deleteFile({
					id: saved.id,
					field,
					etag: saved.etag,
					org_id: orgId,
				});
				return unwrapResult(result)?.etag;
			}
			return saved.etag;
		}, () => {
			const current = pendingRef.current;
			return Boolean(current.file) || (current.removed && current.hadFile);
		});
	}, [registerAfterSave, schemaPack, field]);
}

/** An object URL for a local file, revoked when the file changes or the caller unmounts. */
export function useObjectPreviewUrl(file: File | null): string | null {
	const [url, setUrl] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!file) {
			setUrl(null);
			return undefined;
		}
		const objectUrl = URL.createObjectURL(file);
		setUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return url;
}
