import {
	Command, CommandBusResponse, CommandHandler, CommandResponse, ICommandBus, ModuleLoader, ServiceResult,
} from './types';


/**
 * Framework-agnostic command bus. Publish a command and await its response.
 * Only one handler may be subscribed per command name; a duplicate subscription
 * overrides the previous handler. Supports lazy module loading via an optional
 * `ModuleLoader`: when no handler is found, the bus asks the loader to download
 * the owning module (the `{module_name}` segment of the command name) and retries.
 */
export class CommandBus implements ICommandBus {
	private readonly handlers = new Map<string, CommandHandler>();
	private readonly prefixHandlers = new Map<string, CommandHandler>();
	private moduleLoader?: ModuleLoader;
	private readonly inflightLoads = new Map<string, Promise<'loaded' | 'not_registered'>>();

	public subscribe(name: string, handler: CommandHandler): () => void {
		if (this.handlers.has(name)) {
			const handlerName = handler.name || 'anonymous';
			console.warn(`CommandBus: handler for "${name}" overridden by "${handlerName}".`);
		}
		this.handlers.set(name, handler);
		return () => {
			if (this.handlers.get(name) === handler) {
				this.handlers.delete(name);
			}
		};
	}

	public subscribePrefix(prefix: string, handler: CommandHandler): () => void {
		if (this.prefixHandlers.has(prefix)) {
			const handlerName = handler.name || 'anonymous';
			console.warn(`CommandBus: prefix handler for "${prefix}" overridden by "${handlerName}".`);
		}
		this.prefixHandlers.set(prefix, handler);
		return () => {
			if (this.prefixHandlers.get(prefix) === handler) {
				this.prefixHandlers.delete(prefix);
			}
		};
	}

	public has(name: string): boolean {
		return this.handlers.has(name) || this.findPrefixHandler(name) !== undefined;
	}

	public setModuleLoader(loader: ModuleLoader): void {
		this.moduleLoader = loader;
	}

	public async publish<TData = unknown, _TError = unknown>(
		command: Command,
	): Promise<CommandBusResponse<TData>> {
		const handler = await this.resolveHandler(command.name);
		if (!handler) {
			return this.toResponse<TData>(null, new Error(`No handler for command "${command.name}".`));
		}
		try {
			const returned = await handler(command);
			return this.toResponse<TData>(normalizeResult<TData>(returned), null);
		}
		catch (error) {
			return this.toResponse<TData>(null, error);
		}
	}

	/** Exact name first, then the longest matching prefix, then a lazy module load. */
	private async resolveHandler(commandName: string): Promise<CommandHandler | undefined> {
		const exact = this.handlers.get(commandName);
		if (exact) return exact;

		const byPrefix = this.findPrefixHandler(commandName);
		if (byPrefix) return byPrefix;

		return this.resolveLazyHandler(commandName);
	}

	private findPrefixHandler(commandName: string): CommandHandler | undefined {
		let bestPrefix = '';
		let bestHandler: CommandHandler | undefined;
		this.prefixHandlers.forEach((handler, prefix) => {
			if (commandName.startsWith(prefix) && prefix.length > bestPrefix.length) {
				bestPrefix = prefix;
				bestHandler = handler;
			}
		});
		return bestHandler;
	}

	/** Populates the deprecated `data` mirror alongside `result`. */
	private toResponse<TData>(result: ServiceResult<TData> | null, error: unknown): CommandBusResponse<TData> {
		return { result, error, data: result?.data ?? null };
	}

	private async resolveLazyHandler(commandName: string): Promise<CommandHandler | undefined> {
		if (!this.moduleLoader) {
			return undefined;
		}
		const moduleName = commandName.split('.')[0];
		const result = await this.loadModuleOnce(moduleName);
		if (result === 'not_registered') {
			return undefined;
		}
		return this.handlers.get(commandName) ?? this.findPrefixHandler(commandName);
	}

	private loadModuleOnce(moduleName: string): Promise<'loaded' | 'not_registered'> {
		const inflight = this.inflightLoads.get(moduleName);
		if (inflight) {
			return inflight;
		}
		const promise = this.moduleLoader!(moduleName).finally(() => {
			this.inflightLoads.delete(moduleName);
		});
		this.inflightLoads.set(moduleName, promise);
		return promise;
	}
}

/**
 * Coerces a handler's return value to a {@link ServiceResult}.
 *
 * A handler that has not migrated returns the legacy `{data, error}` shape. Its
 * `error` is business-or-technical — the old contract did not distinguish — so it is
 * rethrown, which lands it in `CommandBusResponse.error` exactly where the previous
 * `fail()` path put it.
 */
function normalizeResult<TData>(
	returned: ServiceResult<TData> | CommandResponse<TData>,
): ServiceResult<TData> {
	const candidate = returned as Partial<ServiceResult<TData>> & { error?: unknown };
	if (Array.isArray(candidate.clientErrors)) {
		return { data: candidate.data ?? null, clientErrors: candidate.clientErrors };
	}
	if (candidate.error != null) {
		throw candidate.error;
	}
	return { data: candidate.data ?? null, clientErrors: [] };
}

export function createCommandBus(): CommandBus {
	return new CommandBus();
}
