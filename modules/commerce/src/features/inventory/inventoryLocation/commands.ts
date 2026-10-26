import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { inventoryLocationService } from './inventoryLocationService';
import { INVENTORY_MODULE, INVENTORY_LOCATION_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the stock location resource, all from the schema-driven generic path
 * (`core.resource.inventory_location.*`) served by the Shell's single prefix subscription.
 */
export const InventoryLocationCommands = Object.freeze(resourceCommands(INVENTORY_LOCATION_SCHEMA_NAME));

/**
 * Registers the stock location service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerInventoryLocationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(INVENTORY_LOCATION_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(INVENTORY_LOCATION_SCHEMA_NAME, inventoryLocationService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
