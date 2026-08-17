import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { putawayRuleService } from './putawayRuleService';
import { INVENTORY_MODULE, PUTAWAY_RULE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the resource, all from the schema-driven generic path
 * (`core.resource.inventory_putaway_rule.*`) served by the Shell's single prefix subscription.
 *
 * Nothing here is beyond CRUD: this resource is either part of the working set or archived, so
 * archiving is the whole of its lifecycle and there is no suspend or resume to add.
 */
export const PutawayRuleCommands = Object.freeze(resourceCommands(PUTAWAY_RULE_SCHEMA_NAME));

/**
 * Registers the service. Called synchronously during the micro-app `init` so the service is in
 * place before any generic command is served.
 */
export function registerPutawayRuleCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PUTAWAY_RULE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PUTAWAY_RULE_SCHEMA_NAME, putawayRuleService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
