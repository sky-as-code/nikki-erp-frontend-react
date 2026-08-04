import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerGenericResourceCommands, registerSchemaCommands } from '@nikkierp/common/dynamicModel';
import { IMenuRegistry } from '@nikkierp/ui/menu';

import { registerModuleCommands } from '../erpModules/moduleCommands';
import { registerMenuCommands } from '../menu';


/** Host-owned services the Shell command handlers delegate to. */
export type ShellCommandDeps = {
	menuRegistry: IMenuRegistry,
};

/**
 * Subscribes all Shell-owned command handlers onto the Shell-hosted bus. Called once
 * when the bus is created so handlers exist before any component publishes. Each domain
 * is migrated off Redux incrementally (DUI-011); add its registrar here as it lands.
 */
export function registerShellCommands(bus: ICommandBus, deps: ShellCommandDeps): () => void {
	const unsubscribers = [
		registerModuleCommands(bus),
		registerSchemaCommands(bus),
		// One prefix subscription serving CRUD for every registered schema, including
		// resources defined at runtime that no module knows about.
		registerGenericResourceCommands(bus),
		registerMenuCommands(bus, deps.menuRegistry),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
