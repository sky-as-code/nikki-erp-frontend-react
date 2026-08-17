import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { storageCategoryService } from './storageCategoryService';
import { INVENTORY_MODULE, STORAGE_CATEGORY_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the resource, all from the schema-driven generic path
 * (`core.resource.inventory_storage_category.*`) served by the Shell's single prefix subscription.
 *
 * Nothing here is beyond CRUD: this resource is either part of the working set or archived, so
 * archiving is the whole of its lifecycle and there is no suspend or resume to add.
 */
export const StorageCategoryCommands = Object.freeze(resourceCommands(STORAGE_CATEGORY_SCHEMA_NAME));

/**
 * Registers the service. Called synchronously during the micro-app `init` so the service is in
 * place before any generic command is served.
 */
export function registerStorageCategoryCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(STORAGE_CATEGORY_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STORAGE_CATEGORY_SCHEMA_NAME, storageCategoryService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
