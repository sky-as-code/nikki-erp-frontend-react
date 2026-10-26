import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { configurationService } from './configurationService';
import { CONFIGURATION_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';


/**
 * Command names for this resource, all from the schema-driven generic path
 * (`core.resource.purchase_configuration.*`) served by the Shell's single prefix subscription.
 */
export const ConfigurationCommands = Object.freeze(resourceCommands(CONFIGURATION_SCHEMA_NAME));

/**
 * Registers the service. Called synchronously during the micro-app `init` so it is in place
 * before any generic command is served.
 */
export function registerConfigurationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(CONFIGURATION_SCHEMA_NAME, PURCHASE_MODULE);
	registerCrudService(CONFIGURATION_SCHEMA_NAME, configurationService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
