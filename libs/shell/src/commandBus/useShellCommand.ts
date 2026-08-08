import React from 'react';

import { useShellCommandBus } from '../microApp';

import type { CommandBusResponse } from '@nikkierp/common/commandBus';
import type { ClientErrorItem } from '@nikkierp/common/types';


export type UseShellCommandReturn<TData, TError = unknown> = {
	/** Resolves to the full response so a caller can branch at the call site. */
	publish: (payload?: unknown) => Promise<CommandBusResponse<TData>>,
	data: TData | null,
	/** Validation / business / authorization failures. Empty unless the server rejected. */
	clientErrors: ClientErrorItem[],
	/** TECHNICAL failures only — see `CommandBusResponse.error`. */
	error: TError | null,
	isPending: boolean,
};

/**
 * Shell-side counterpart of `@nikkierp/ui`'s `useCommand`. Reads the bus from the
 * Shell host context (`useShellCommandBus`) so Shell components — which live outside
 * `MicroAppProvider` — can publish commands.
 */
export function useShellCommand<TData = unknown, TError = unknown>(
	commandName: string,
): UseShellCommandReturn<TData, TError> {
	const commandBus = useShellCommandBus();
	const [data, setData] = React.useState<TData | null>(null);
	const [clientErrors, setClientErrors] = React.useState<ClientErrorItem[]>([]);
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
		setClientErrors([]);
		setError(null);
		setIsPending(true);
		const response = await commandBus.publish<TData>({ name: commandName, payload });
		// Superseded by a newer call or unmounted: hand the response back, write no state.
		if (!isMountedRef.current || callId !== callIdRef.current) {
			return response;
		}
		setData(response.result?.data ?? null);
		setClientErrors(response.result?.clientErrors ?? []);
		setError(response.error as TError | null);
		setIsPending(false);
		return response;
	}, [commandBus, commandName]);

	return { publish, data, clientErrors, error, isPending };
}
