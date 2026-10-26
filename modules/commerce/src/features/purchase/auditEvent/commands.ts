import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { auditEventService } from './auditEventService';
import { AUDIT_EVENT_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';


/**
 * Command names for this resource, all from the schema-driven generic path
 * (`core.resource.purchase_audit_event.*`) served by the Shell's single prefix subscription.
 */
export const AuditEventCommands = Object.freeze(resourceCommands(AUDIT_EVENT_SCHEMA_NAME));

/**
 * Registers the service. Called synchronously during the micro-app `init` so it is in place
 * before any generic command is served.
 */
export function registerAuditEventCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(AUDIT_EVENT_SCHEMA_NAME, PURCHASE_MODULE);
	registerCrudService(AUDIT_EVENT_SCHEMA_NAME, auditEventService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
