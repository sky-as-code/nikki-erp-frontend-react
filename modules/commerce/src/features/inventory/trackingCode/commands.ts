import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { trackingCodeService } from './trackingCodeService';
import { TRACKING_CODE_SCHEMA_NAME, INVENTORY_MODULE } from '../../../constants/inventory';


/**
 * Command names for the lot resource, all from the schema-driven generic path
 * (`core.resource.inventory_tracking_code.*`) served by the Shell's single prefix subscription.
 */
export const TrackingCodeCommands = Object.freeze(resourceCommands(TRACKING_CODE_SCHEMA_NAME));

/**
 * Registers the lot service. Called synchronously during the micro-app `init` so the service is
 * in place before any generic command is served.
 */
export function registerTrackingCodeCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(TRACKING_CODE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(TRACKING_CODE_SCHEMA_NAME, trackingCodeService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
