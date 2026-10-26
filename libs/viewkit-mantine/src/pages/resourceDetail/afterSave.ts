import { notifications } from '@mantine/notifications';
import { withResourceFiles } from '@nikkierp/common/dynamicModel';
import React from 'react';

import type { RestFiles } from '@nikkierp/common/dynamicModel';


export type SavedRecord = {
	id: string,
	etag?: string,
	values: Record<string, any>,
};

export type AfterSaveHook = (saved: SavedRecord) => Promise<string | undefined>;

export type RegisterAfterSave = (hook: AfterSaveHook, hasPending?: () => boolean) => () => void;

export function useAfterSaveHooks(): {
	register: RegisterAfterSave,
	run: (saved: SavedRecord) => Promise<void>,
	hasPending: () => boolean,
	isRunning: boolean,
} {
	const hooksRef = React.useRef(new Map<AfterSaveHook, () => boolean>());
	const [isRunning, setIsRunning] = React.useState(false);

	const register = React.useCallback<RegisterAfterSave>((hook, hasPending = () => false) => {
		hooksRef.current.set(hook, hasPending);
		return () => {
			hooksRef.current.delete(hook);
		};
	}, []);

	const hasPending = React.useCallback(
		() => [...hooksRef.current.values()].some(check => check()),
		[],
	);

	const run = React.useCallback(async (saved: SavedRecord): Promise<void> => {
		if (hooksRef.current.size === 0) {
			return;
		}
		setIsRunning(true);
		try {
			let etag = saved.etag;
			for (const hook of hooksRef.current.keys()) {
				etag = await hook({ ...saved, etag }) ?? etag;
			}
		}
		finally {
			setIsRunning(false);
		}
	}, []);

	return { register, run, hasPending, isRunning };
}

/**
 * Adds keys to the update request itself, for a section whose edits must land in the same write
 * as the form's fields (e.g. a role's entitlement delta) rather than in a second request after it.
 */
export type UpdatePayloadContributor = {
	/** The keys to merge into the next update request, or `undefined` while there is nothing to send. */
	build: () => Record<string, unknown> | undefined,
	/** Called once an update that carried this contribution has succeeded. */
	onSaved?: () => void,
	/**
	 * Asked before the request carrying this contribution is sent, with the whole request. Resolving
	 * `false` cancels the save and keeps the form in edit mode, e.g. when the user declines a
	 * preview of what the write would do.
	 */
	confirm?: (request: Record<string, unknown>) => Promise<boolean>,
};

export type RegisterUpdatePayload = (contributor: UpdatePayloadContributor) => () => void;

export type UpdatePayloadContributions = {
	payload: Record<string, unknown>,
	notifySaved: () => void,
	/** Every contributing section's `confirm`, in turn; `false` as soon as one declines. */
	confirm: (request: Record<string, unknown>) => Promise<boolean>,
};

export function useUpdatePayloadContributors(): {
	register: RegisterUpdatePayload,
	hasPending: () => boolean,
	collect: () => UpdatePayloadContributions,
} {
	const contributorsRef = React.useRef(new Set<UpdatePayloadContributor>());

	const register = React.useCallback<RegisterUpdatePayload>((contributor) => {
		contributorsRef.current.add(contributor);
		return () => {
			contributorsRef.current.delete(contributor);
		};
	}, []);

	const hasPending = React.useCallback(
		() => [...contributorsRef.current].some(contributor => contributor.build() !== undefined),
		[],
	);

	const collect = React.useCallback(() => collectContributions([...contributorsRef.current]), []);

	return { register, hasPending, collect };
}

/** Exported for tests: merges every pending contribution and notifies only those that sent one. */
export function collectContributions(contributors: UpdatePayloadContributor[]): UpdatePayloadContributions {
	const payload: Record<string, unknown> = {};
	const contributing: UpdatePayloadContributor[] = [];
	contributors.forEach(contributor => {
		const part = contributor.build();
		if (part !== undefined) {
			Object.assign(payload, part);
			contributing.push(contributor);
		}
	});
	return {
		payload,
		notifySaved: () => contributing.forEach(contributor => contributor.onSaved?.()),
		confirm: async (request) => {
			for (const contributor of contributing) {
				if (contributor.confirm && !(await contributor.confirm(request))) {
					return false;
				}
			}
			return true;
		},
	};
}

/** A file field's edit, staged until the record's own Save: a new file to send, or the stored one cleared. */
export type StagedFile = { file: File } | { removed: true };

/** A file field taking part in the record's create or update request. */
export type FileFieldContributor = {
	/** The record field holding the file id, e.g. `avatar_file_id`. */
	field: string,
	/** The staged edit, or `undefined` while the field is untouched. */
	staged: () => StagedFile | undefined,
};

export type RegisterFileField = (contributor: FileFieldContributor) => () => void;

export type FileFieldContributions = {
	/** New files keyed by field: they turn the request into the BFF's multipart resource form. */
	files: RestFiles,
	/** Cleared fields, sent as `null` in the JSON payload. */
	cleared: Record<string, null>,
};

/**
 * The file fields of a detail form. Their staged edits travel in the record's own create or update:
 * no separate upload, and no second request after the save.
 */
export function useFileFieldContributors(): {
	register: RegisterFileField,
	hasPending: () => boolean,
	collect: () => FileFieldContributions,
} {
	const contributorsRef = React.useRef(new Set<FileFieldContributor>());

	const register = React.useCallback<RegisterFileField>((contributor) => {
		contributorsRef.current.add(contributor);
		return () => {
			contributorsRef.current.delete(contributor);
		};
	}, []);

	const hasPending = React.useCallback(
		() => [...contributorsRef.current].some(contributor => contributor.staged() !== undefined),
		[],
	);

	const collect = React.useCallback(() => collectFileFields([...contributorsRef.current]), []);

	return { register, hasPending, collect };
}

/** Exported for tests: splits the staged edits into files to send and fields to clear. */
export function collectFileFields(contributors: FileFieldContributor[]): FileFieldContributions {
	const files: RestFiles = {};
	const cleared: Record<string, null> = {};
	contributors.forEach(contributor => {
		const staged = contributor.staged();
		if (staged && 'file' in staged) {
			files[contributor.field] = staged.file;
		}
		else if (staged) {
			cleared[contributor.field] = null;
		}
	});
	return { files, cleared };
}

/** The create or update command payload carrying the staged file edits. */
export function withFileFields<TRequest extends Record<string, any>>(
	request: TRequest, contributions: FileFieldContributions,
): TRequest {
	return withResourceFiles({ ...request, ...contributions.cleared }, contributions.files);
}

export function notifyAfterSaveFailure(error: unknown): void {
	console.error(error);
	notifications.show({
		color: 'red',
		message: error instanceof Error ? error.message : String(error),
	});
}

export function useUpdateAfterSave(
	id: string | undefined,
	resource: Record<string, unknown> | undefined,
	refresh: () => void,
): {
	register: RegisterAfterSave,
	hasPending: () => boolean,
	isRunning: boolean,
	runAfterUpdate: (etag: string | undefined, values: Record<string, any>) => Promise<void>,
	submitAfterSaveOnly: () => Promise<boolean>,
} {
	const { register, run, hasPending, isRunning } = useAfterSaveHooks();
	const resourceEtag = typeof resource?.etag === 'string' ? resource.etag : undefined;

	const runAfterUpdate = React.useCallback(async (etag: string | undefined, values: Record<string, any>) => {
		if (!id) return;
		try {
			await run({ id, etag, values });
		}
		catch (error) {
			notifyAfterSaveFailure(error);
		}
	}, [id, run]);

	const submitAfterSaveOnly = React.useCallback(async (): Promise<boolean> => {
		if (!id) return false;
		try {
			await run({ id, etag: resourceEtag, values: {} });
		}
		catch (error) {
			notifyAfterSaveFailure(error);
			return false;
		}
		refresh();
		return true;
	}, [id, resourceEtag, run, refresh]);

	return { register, hasPending, isRunning, runAfterUpdate, submitAfterSaveOnly };
}
