import { ICommandBus } from '@nikkierp/common/commandBus';

import { moduleService } from './moduleService';
import * as t from './types';


/** Shell-owned ERP module command names: `shell.erp_modules.{action}`. */
export const MODULE_COMMANDS = {
	listAll: 'shell.erp_modules.list_all',
	search: 'shell.erp_modules.search',
} as const;

/**
 * Subscribes the ERP module command handlers onto the Shell-hosted bus.
 *
 * The handlers call the same `moduleService` singleton the Shell's own components
 * dispatch through, so both paths hit one instance and one slice.
 */
export function registerModuleCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(MODULE_COMMANDS.listAll, () => moduleService.listAll()),
		bus.subscribe(
			MODULE_COMMANDS.search,
			cmd => moduleService.search(cmd.payload as t.SearchModuleRequest),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
