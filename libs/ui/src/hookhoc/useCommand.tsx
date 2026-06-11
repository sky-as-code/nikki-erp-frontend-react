import React from 'react';

import { useCommandBus } from '../microApp';


export type UseCommandReturn<TData, TError> = {
	publish: (payload?: unknown) => Promise<void>,
	data: TData | null,
	error: TError | null,
	isPending: boolean,
};

/**
 * Publishes a command through the Shell-hosted command bus. `isPending` becomes
 * `true` as soon as the command is published and resolves to `false` once a
 * response arrives. `data` and `error` are mutually exclusive (the other is `null`).
 */
export function useCommand<TData = unknown, TError = unknown>(
	commandName: string,
): UseCommandReturn<TData, TError> {
	const commandBus = useCommandBus();
	const [data, setData] = React.useState<TData | null>(null);
	const [error, setError] = React.useState<TError | null>(null);
	const [isPending, setIsPending] = React.useState(false);
	const isMountedRef = React.useRef(true);
	const callIdRef = React.useRef(0);

	React.useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const publish = React.useCallback(async (payload?: unknown) => {
		const callId = ++callIdRef.current;
		setData(null);
		setError(null);
		setIsPending(true);
		const response = await commandBus.publish<TData, TError>({ name: commandName, payload });
		if (!isMountedRef.current || callId !== callIdRef.current) {
			return;
		}
		setData(response.data);
		setError(response.error);
		setIsPending(false);
	}, [commandBus, commandName]);

	return { publish, data, error, isPending };
}
