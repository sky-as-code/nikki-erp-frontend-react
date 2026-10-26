import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { supplyRelationService } from './supplyRelationService';
import { INVENTORY_MODULE, SUPPLY_RELATION_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the resource, all from the schema-driven generic path
 * (`core.resource.inventory_warehouse_supply_relation.*`) served by the Shell's single prefix subscription.
 *
 * Nothing here is beyond CRUD: this resource is either part of the working set or archived, so
 * archiving is the whole of its lifecycle and there is no suspend or resume to add.
 */
export const SupplyRelationCommands = Object.freeze(resourceCommands(SUPPLY_RELATION_SCHEMA_NAME));

/**
 * Registers the service. Called synchronously during the micro-app `init` so the service is in
 * place before any generic command is served.
 */
export function registerSupplyRelationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SUPPLY_RELATION_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(SUPPLY_RELATION_SCHEMA_NAME, supplyRelationService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
