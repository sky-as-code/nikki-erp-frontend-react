import React from 'react';

import { useShellCommandBus } from '../microApp';


export type UseShellCommandReturn<TData, TError> = {
	publish: (payload?: unknown) => Promise<void>,
	data: TData | null,
	error: TError | null,
	isPending: boolean,
};

/**
 * Shell-side counterpart of `@nikkierp/ui`'s `useCommand`. Reads the bus from the
 * Shell host context (`useShellCommandBus`) so Shell components — which live outside
 * `MicroAppProvider` — can publish commands. `data`/`error` are mutually exclusive.
 */
export function useShellCommand<TData = unknown, TError = unknown>(
	commandName: string,
): UseShellCommandReturn<TData, TError> {
	const commandBus = useShellCommandBus();
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
