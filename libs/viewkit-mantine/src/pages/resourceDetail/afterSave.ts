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
