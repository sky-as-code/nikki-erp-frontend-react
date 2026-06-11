import { Command, CommandHandler, CommandResponse, fail, ICommandBus, ModuleLoader } from './types';


/**
 * Framework-agnostic command bus. Publish a command and await its response.
 * Only one handler may be subscribed per command name; a duplicate subscription
 * overrides the previous handler. Supports lazy module loading via an optional
 * `ModuleLoader`: when no handler is found, the bus asks the loader to download
 * the owning module (the `{module_name}` segment of the command name) and retries.
 */
export class CommandBus implements ICommandBus {
	private readonly handlers = new Map<string, CommandHandler>();
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

	public has(name: string): boolean {
		return this.handlers.has(name);
	}

	public setModuleLoader(loader: ModuleLoader): void {
		this.moduleLoader = loader;
	}

	public async publish<TData = unknown, TError = unknown>(
		command: Command,
	): Promise<CommandResponse<TData, TError>> {
		let handler = this.handlers.get(command.name);
		if (!handler) {
			handler = await this.resolveLazyHandler(command.name);
		}
		if (!handler) {
			return fail(new Error(`No handler for command "${command.name}".`)) as CommandResponse<TData, TError>;
		}
		try {
			return (await handler(command)) as CommandResponse<TData, TError>;
		}
		catch (error) {
			return fail(error) as CommandResponse<TData, TError>;
		}
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
		return this.handlers.get(commandName);
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

export function createCommandBus(): CommandBus {
	return new CommandBus();
}
