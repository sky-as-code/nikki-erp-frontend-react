import { ICommandBus } from '@nikkierp/common/commandBus';

import { registerModuleCommands } from '../erpModules/moduleCommands';


/**
 * Subscribes all Shell-owned command handlers onto the Shell-hosted bus. Called once
 * when the bus is created so handlers exist before any component publishes. Each domain
 * is migrated off Redux incrementally (DUI-011); add its registrar here as it lands.
 */
export function registerShellCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		registerModuleCommands(bus),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
