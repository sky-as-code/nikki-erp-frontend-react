import { ICommandBus, ServiceResult } from '@nikkierp/common/commandBus';
import { CrudServiceBase } from '@nikkierp/common/service';

import * as t from './types';
import { MODULE_SCHEMA_NAME } from '../constants';


/** Shell-owned ERP module command names: `shell.erp_modules.{action}`. */
export const MODULE_COMMANDS = {
	listAll: 'shell.erp_modules.list_all',
	search: 'shell.erp_modules.search',
} as const;

/** Reads over `essential_module_metadata`; the Shell never mutates it. */
class ModuleService extends CrudServiceBase {
	public constructor() {
		super({ moduleName: 'shell', schemaName: MODULE_SCHEMA_NAME });
	}

	/** Every module in one page — the count is small and bounded by the backend. */
	public listAll(): Promise<ServiceResult<t.SearchModuleResponse>> {
		return this.search({ page: 0, size: 500 });
	}
}

const moduleService = new ModuleService();

/** Subscribes the ERP module command handlers onto the Shell-hosted bus. */
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
