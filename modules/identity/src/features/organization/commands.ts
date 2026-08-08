import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { orgService } from './orgService';
import { IAM_MODULE, ORGANIZATION_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the organization resource, all from the schema-driven generic path
 * (`core.resource.iam_organization.*`) served by the Shell's single prefix subscription.
 *
 * `orgService.getBySlug` needs no command of its own: the generic `GET_ONE` action URL-encodes
 * every payload key into the query, so publishing it with `{ slug }` reaches the same endpoint.
 */
export const OrganizationCommands = Object.freeze(resourceCommands(ORGANIZATION_SCHEMA_NAME));

/**
 * Registers the organization service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerOrganizationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(ORGANIZATION_SCHEMA_NAME, IAM_MODULE);
	registerCrudService(ORGANIZATION_SCHEMA_NAME, orgService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
