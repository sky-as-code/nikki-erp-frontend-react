import { CommandBus, ICommandBus, ModuleLoader } from '@nikkierp/common/commandBus';
import { MicroAppManager } from '@nikkierp/ui/microApp';

import { registerShellCommands, ShellCommandDeps } from './registerShellCommands';


/**
 * Creates the single command bus instance hosted by the Shell. The bus is wired
 * with a module loader backed by the {@link MicroAppManager}: when a command targets
 * a module that has not been loaded yet, the bus downloads and initializes that
 * micro-app (subscribing its handlers) before retrying the lookup. Shell-owned
 * command handlers are subscribed synchronously here.
 */
export function createShellCommandBus(manager: MicroAppManager, deps: ShellCommandDeps): ICommandBus {
	const bus = new CommandBus();
	bus.setModuleLoader(makeModuleLoader(manager));
	registerShellCommands(bus, deps);
	return bus;
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
