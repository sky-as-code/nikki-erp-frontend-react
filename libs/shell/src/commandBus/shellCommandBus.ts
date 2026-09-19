import { CommandBus, ICommandBus, ModuleLoader } from '@nikkierp/common/commandBus';
import { schemaRegistry, SchemaOwnerLoader } from '@nikkierp/common/dynamicModel';
import { MicroAppManager } from '@nikkierp/ui/microApp';

import { registerShellCommands, ShellCommandDeps } from './registerShellCommands';


/**
 * Creates the single command bus instance hosted by the Shell. The bus is wired
 * with a module loader backed by the {@link MicroAppManager}: when a command targets
 * a module that has not been loaded yet, the bus downloads and initializes that
 * micro-app (subscribing its handlers) before retrying the lookup. Shell-owned
 * command handlers are subscribed synchronously here.
 *
 * The schema registry gets the same treatment against the same manager. It needs its own loader
 * because `core.dynamic_model.get_schema` carries its target in the payload, not in the command
 * name, so the bus's name-derived lazy loading can never reach the owning micro-app.
 */
export function createShellCommandBus(manager: MicroAppManager, deps: ShellCommandDeps): ICommandBus {
	const bus = new CommandBus();
	bus.setModuleLoader(makeModuleLoader(manager));
	schemaRegistry.setOwnerLoader(makeSchemaOwnerLoader(manager));
	registerShellCommands(bus, deps);
	return bus;
}

function makeSchemaOwnerLoader(manager: MicroAppManager): SchemaOwnerLoader {
	return async function loadSchemaOwner(schemaName: string) {
		const slug = manager.findOwnerSlug(schemaName);
		if (!slug) {
			return 'unknown';
		}
		await manager.ensureLoaded(slug);
		return 'loaded';
	};
}

function makeModuleLoader(manager: MicroAppManager): ModuleLoader {
	return async function loadModule(moduleName: string) {
		if (!manager.isRegistered(moduleName)) {
			return 'not_registered';
		}
		await manager.ensureLoaded(moduleName);
		return 'loaded';
	};
}
