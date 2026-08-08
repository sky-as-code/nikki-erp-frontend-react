import { ClientErrorItem } from '../types/common';


export type Command<TPayload = unknown> = {
	name: string,
	payload?: TPayload,
};

/**
 * What every service method resolves to.
 *
 * - `data` is the successful payload, or `null` when the operation was rejected.
 * - `clientErrors` holds validation / business / authorization failures the user can
 *   act on. Always an array; empty on success.
 *
 * Technical failures (5xx, network, programmer error) are **thrown**, never returned.
 */
export type ServiceResult<TData = unknown> = {
	data: TData | null,
	clientErrors: ClientErrorItem[],
};

/**
 * Response of a published command.
 *
 * `result` is what the handler returned; it is `null` only when `error` is set.
 */
export type CommandBusResponse<TData = unknown> = {
	result: ServiceResult<TData> | null,

	/**
	 * TECHNICAL errors only — a thrown exception, a 5xx, a network or parse failure,
	 * or an unregistered command name.
	 *
	 * Business, validation and authorization failures are NOT errors: they belong in
	 * `result.clientErrors`. Never assign them here.
	 */
	error: unknown | null,

	/**
	 * @deprecated Read `result.data`. Kept so modules not yet migrated keep compiling.
	 */
	data: TData | null,
};

/**
 * @deprecated Use {@link CommandBusResponse}, which separates `result.clientErrors`
 * from technical `error`. This is the legacy `{data, error}` shape, kept only so
 * modules not yet migrated keep compiling.
 */
export type CommandResponse<TData = unknown, TError = unknown> =
	| { data: TData, error: null, clientErrors?: ClientErrorItem[] }
	| { data: null, error: TError, clientErrors?: ClientErrorItem[] };

/**
 * A handler returns a {@link ServiceResult} — this is what forces the
 * `{data, clientErrors}` convention on every service. Technical failures are thrown
 * and the bus converts them into `CommandBusResponse.error`.
 *
 * The legacy {@link CommandResponse} shape is still accepted so modules that have not
 * migrated keep compiling; the bus normalises it. Do not rely on it in new code.
 */
export type CommandHandler<TPayload = any, TData = any> = (command: Command<TPayload>) =>
	| ServiceResult<TData> | Promise<ServiceResult<TData>>
	| CommandResponse<TData> | Promise<CommandResponse<TData>>;

/**
 * Loads the micro-app/module that owns the `{module_name}` segment of a command name.
 * Returns `'loaded'` when the module is now present (handlers subscribed),
 * or `'not_registered'` when the module name is unknown to the host.
 */
export type ModuleLoader = (moduleName: string) => Promise<'loaded' | 'not_registered'>;

export interface ICommandBus {
	subscribe(name: string, handler: CommandHandler): () => void;

	/**
	 * Subscribes a fallback handler for every command name starting with `prefix`.
	 *
	 * Exact-name handlers always win; among prefixes the longest match wins. This is
	 * what lets a resource created at runtime be served without being known at
	 * subscribe time — the command bus itself has no wildcard support.
	 */
	subscribePrefix(prefix: string, handler: CommandHandler): () => void;

	/**
	 * `_TError` is accepted but ignored — technical errors are always `unknown`. It
	 * exists so call sites written against the previous two-parameter signature keep
	 * compiling.
	 */
	publish<TData = unknown, _TError = unknown>(command: Command): Promise<CommandBusResponse<TData>>;
	has(name: string): boolean;
	setModuleLoader(loader: ModuleLoader): void;
}

/**
 * A successful {@link ServiceResult}.
 *
 * Also carries `error: null` so the value still satisfies the deprecated
 * {@link CommandResponse} shape while modules migrate.
 */
export function ok<TData>(
	data: TData,
): { data: TData, clientErrors: ClientErrorItem[], error: null } {
	return { data, clientErrors: [], error: null };
}

/** A {@link ServiceResult} rejected by the server for a reason the user can act on. */
export function clientFail(clientErrors: ClientErrorItem[]): ServiceResult<never> & { error: null } {
	return { data: null, clientErrors, error: null };
}

/**
 * @deprecated Technical failures must be thrown, not returned; business failures use
 * {@link clientFail}. Kept so modules not yet migrated keep compiling — it returns the
 * legacy `{data: null, error}` shape rather than throwing, so existing control flow is
 * preserved until each call site is converted.
 */
export function fail<TError>(error: TError): { data: null, clientErrors: ClientErrorItem[], error: TError } {
	return { data: null, clientErrors: [], error };
}
