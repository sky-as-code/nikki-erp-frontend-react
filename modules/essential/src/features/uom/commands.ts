import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { uomService } from './uomService';
import { ESSENTIAL_MODULE, UOM_SCHEMA_NAME } from '../../constants';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names for the unit-of-measure resource.
 *
 * All of them come from the schema-driven generic path (`core.resource.essential_uom.*`),
 * served by the Shell's single prefix subscription — this module subscribes none of them.
 * The backend serves this resource entirely through the dynamic resource engine, so there is
 * no endpoint the generic CRUD commands cannot reach.
 */
export const UomCommands = Object.freeze({
	...resourceCommands(UOM_SCHEMA_NAME),
} as const);

/**
 * Registers the UoM service so the Shell's generic CRUD handler can resolve it. Called
 * synchronously during the micro-app `init` so lazy command resolution finds it.
 * Returns a function that undoes the registration (for teardown).
 */
export function registerUomCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(UOM_SCHEMA_NAME, ESSENTIAL_MODULE);
	registerCrudService(UOM_SCHEMA_NAME, uomService);

	return () => { /* nothing subscribed, so nothing to unsubscribe */ };
}
