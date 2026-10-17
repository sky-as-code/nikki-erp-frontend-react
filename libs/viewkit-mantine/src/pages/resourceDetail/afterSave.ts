import { notifications } from '@mantine/notifications';
import React from 'react';


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
};

export type RegisterUpdatePayload = (contributor: UpdatePayloadContributor) => () => void;

export type UpdatePayloadContributions = {
	payload: Record<string, unknown>,
	notifySaved: () => void,
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
	};
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
