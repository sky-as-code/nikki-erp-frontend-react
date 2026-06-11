export type Command<TPayload = unknown> = {
	name: string,
	payload?: TPayload,
};

/**
 * Response of a published command. `data` and `error` are mutually exclusive:
 * exactly one of them is non-null. Either value may or may not be serializable.
 */
export type CommandResponse<TData = unknown, TError = unknown> =
	| { data: TData, error: null }
	| { data: null, error: TError };

export type CommandHandler<TPayload = any, TData = any, TError = any> =
	(command: Command<TPayload>) => CommandResponse<TData, TError> | Promise<CommandResponse<TData, TError>>;

/**
 * Loads the micro-app/module that owns the `{module_name}` segment of a command name.
 * Returns `'loaded'` when the module is now present (handlers subscribed),
 * or `'not_registered'` when the module name is unknown to the host.
 */
export type ModuleLoader = (moduleName: string) => Promise<'loaded' | 'not_registered'>;

export interface ICommandBus {
	subscribe(name: string, handler: CommandHandler): () => void;
	publish<TData = unknown, TError = unknown>(command: Command): Promise<CommandResponse<TData, TError>>;
	has(name: string): boolean;
	setModuleLoader(loader: ModuleLoader): void;
}

export function ok<TData>(data: TData): CommandResponse<TData, never> {
	return { data, error: null };
}

export function fail<TError>(error: TError): CommandResponse<never, TError> {
	return { data: null, error };
}
