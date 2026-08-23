import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { shellStore } from '../appState/shellStore';
import { MODULE_SCHEMA_NAME } from '../constants';

import type { ServiceResult } from '@nikkierp/common/commandBus';


/**
 * Reads over `essential_module_metadata`; the Shell never mutates it.
 *
 * Used two ways, both against this one instance: `libs/shell` dispatches through the
 * generated slice (`useServiceLayer`), while modules reach it over the command bus as
 * `shell.erp_modules.*` — see ./moduleCommands.ts.
 */
@storeService('erpModules', shellStore)
export class ModuleService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: 'shell', schemaName: MODULE_SCHEMA_NAME });
	}

	/**
	 * Every module in one page — the count is small and bounded by the backend.
	 *
	 * Ordered by `name` so the response is stable rather than whatever order the rows come back
	 * in. Callers that display modules re-sort by the translated label, which the server cannot
	 * order by: the label is an i18n string in the client bundle, not a column.
	 */
	@storeAsyncMethod
	public listAll(): Promise<ServiceResult<t.SearchModuleResponse>> {
		return this.search({ page: 0, size: 500, graph: { order: [['name', 'asc']] } });
	}
}

export const moduleService = new ModuleService();
