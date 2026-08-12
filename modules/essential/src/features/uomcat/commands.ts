import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { uomCatService } from './uomCatService';
import { ESSENTIAL_MODULE, UOMCAT_SCHEMA_NAME } from '../../constants';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names for the UoM category resource. As with {@link UomCommands}, every name comes
 * from the generic schema-driven path and the Shell serves them all.
 */
export const UomCatCommands = Object.freeze({
	...resourceCommands(UOMCAT_SCHEMA_NAME),
} as const);

export function registerUomCatCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(UOMCAT_SCHEMA_NAME, ESSENTIAL_MODULE);
	registerCrudService(UOMCAT_SCHEMA_NAME, uomCatService);

	return () => { /* nothing subscribed, so nothing to unsubscribe */ };
}
