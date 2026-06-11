import { CommandResponse, fail, ICommandBus, ok } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';

import * as t from './types';
import { MODULE_SCHEMA_NAME } from '../constants';


/** Shell-owned ERP module command names: `shell.erp_modules.{action}`. */
export const MODULE_COMMANDS = {
	listAll: 'shell.erp_modules.list_all',
	search: 'shell.erp_modules.search',
} as const;

type ModuleServiceResult<TData> = Promise<CommandResponse<TData, unknown>>;

async function withModuleSchema<TData>(fn: (schema: dyn.SchemaPack) => Promise<TData>): ModuleServiceResult<TData> {
	try {
		const schema = await dyn.schemaRegistry.get(MODULE_SCHEMA_NAME);
		if (!schema) {
			return fail(new Error(`Schema "${MODULE_SCHEMA_NAME}" is not registered.`));
		}
		return ok(await fn(schema));
	}
	catch (error) {
		return fail(error);
	}
}

function listAllModules(): ModuleServiceResult<t.SearchModuleResponse> {
	return withModuleSchema(schema => schema.restApi.search({ page: 0, size: 500 }));
}

function searchModules(request: t.SearchModuleRequest): ModuleServiceResult<t.SearchModuleResponse> {
	return withModuleSchema(schema => schema.restApi.search(request));
}

/** Subscribes the ERP module command handlers onto the Shell-hosted bus. */
export function registerModuleCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(MODULE_COMMANDS.listAll, () => listAllModules()),
		bus.subscribe(MODULE_COMMANDS.search, cmd => searchModules(cmd.payload as t.SearchModuleRequest)),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
