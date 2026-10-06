import { notifications } from '@mantine/notifications';
import React from 'react';


export type SavedRecord = {
	id: string,
	etag?: string,
	values: Record<string, any>,
};

export type AfterSaveHook = (saved: SavedRecord) => Promise<string | undefined>;

export type RegisterAfterSave = (hook: AfterSaveHook) => () => void;

export function useAfterSaveHooks(): {
	register: RegisterAfterSave,
	run: (saved: SavedRecord) => Promise<void>,
	isRunning: boolean,
} {
	const hooksRef = React.useRef(new Set<AfterSaveHook>());
	const [isRunning, setIsRunning] = React.useState(false);

	const register = React.useCallback<RegisterAfterSave>(hook => {
		hooksRef.current.add(hook);
		return () => {
			hooksRef.current.delete(hook);
		};
	}, []);

	const run = React.useCallback(async (saved: SavedRecord): Promise<void> => {
		if (hooksRef.current.size === 0) {
			return;
		}
		setIsRunning(true);
		try {
			let etag = saved.etag;
			for (const hook of hooksRef.current) {
				etag = await hook({ ...saved, etag }) ?? etag;
			}
		}
		finally {
			setIsRunning(false);
		}
	}, []);

	return { register, run, isRunning };
}

export function notifyAfterSaveFailure(error: unknown): void {
	console.error(error);
	notifications.show({
		color: 'red',
		message: error instanceof Error ? error.message : String(error),
	});
}
