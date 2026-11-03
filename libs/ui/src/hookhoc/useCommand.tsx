import React from 'react';

import { publishTraced } from './tracedPublish';
import { useCommandBus } from '../microApp';

import type { CommandBusResponse } from '@nikkierp/common/commandBus';
import type { ClientErrorItem } from '@nikkierp/common/types';


export type UseCommandReturn<TData, TError = unknown> = {
	/**
	 * Publishes the command and resolves to the full response, so a caller can react
	 * at the call site — mapping `clientErrors` onto form fields, for instance —
	 * rather than waiting a render for the state below.
	 */
	publish: (payload?: unknown) => Promise<CommandBusResponse<TData>>,
	data: TData | null,
	/** Validation / business / authorization failures. Empty unless the server rejected. */
	clientErrors: ClientErrorItem[],
	/** TECHNICAL failures only — see `CommandBusResponse.error`. */
	error: TError | null,
	isPending: boolean,
};

export type UseCommandOptions = {
	/**
	 * Traces each publish as one user operation of this fixed name (`UI_OPERATIONS`): a screen load, a save,
	 * a custom action. Leave it out for a command that is no user operation of its own.
	 */
	operation?: string,
};

/**
 * Publishes a command through the Shell-hosted command bus. `isPending` becomes
 * `true` as soon as the command is published and resolves to `false` once a
 * response arrives.
 *
 * A rejected operation populates `clientErrors` and leaves `error` null; only a
 * technical failure sets `error`.
 */
export function useCommand<TData = unknown, TError = unknown>(
	commandName: string, options?: UseCommandOptions,
): UseCommandReturn<TData, TError> {
	const operationName = options?.operation;
	const commandBus = useCommandBus();
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
		const response = await publishTraced<TData>(commandBus, { name: commandName, payload }, operationName);
		// Superseded by a newer call or unmounted: still hand the response back to the
		// caller, but do not write stale state.
		if (!isMountedRef.current || callId !== callIdRef.current) {
			return response;
		}
		setData(response.result?.data ?? null);
		setClientErrors(response.result?.clientErrors ?? []);
		setError(response.error as TError | null);
		setIsPending(false);
		return response;
	}, [commandBus, commandName, operationName]);

	return { publish, data, clientErrors, error, isPending };
}
