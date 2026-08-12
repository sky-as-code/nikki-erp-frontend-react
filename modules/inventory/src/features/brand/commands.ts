import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { brandService } from './brandService';
import { BRAND_SCHEMA_NAME, INVENTORY_MODULE } from '../../constants';


/**
 * Command names for the brand resource, all from the schema-driven generic path
 * (`core.resource.inventory_brand.*`) served by the Shell's single prefix subscription.
 */
export const BrandCommands = Object.freeze(resourceCommands(BRAND_SCHEMA_NAME));

/**
 * Registers the brand service. Called synchronously during the micro-app `init` so the service is
 * in place before any generic command is served.
 */
export function registerBrandCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(BRAND_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(BRAND_SCHEMA_NAME, brandService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
