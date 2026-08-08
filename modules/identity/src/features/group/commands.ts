import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { groupService } from './groupService';
import { GROUP_SCHEMA_NAME, IAM_MODULE } from '../../constants';
import * as ra from '../roleAssignment';


const PREFIX = `${IAM_MODULE}.${GROUP_SCHEMA_NAME}`;

/**
 * Command names for the group resource.
 *
 * The CRUD names come from the schema-driven generic path (`core.resource.iam_group.*`), served by
 * the Shell's single prefix subscription — this module subscribes none of them. `groupService`
 * stays reachable through them because `registerCrudService` below hands it to that handler, and
 * `manageUsers` is published as the generic `manage_m2m` with `path: 'manage-users'`.
 *
 * The remaining two hit role-assignment endpoints the dynamic schema cannot express.
 */
export const GroupCommands = Object.freeze({
	...resourceCommands(GROUP_SCHEMA_NAME),
	MANAGE_ROLE_ASSIGNMENTS: `${PREFIX}.manage_group_role_assignments`,
	SEARCH_ASSIGNED_ROLES: `${PREFIX}.search_group_assigned_roles`,
} as const);

/**
 * Registers the group service and subscribes the non-CRUD handlers. Called synchronously during
 * the micro-app `init` so the service is in place before any generic command is served.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerGroupCommands(bus: ICommandBus): () => void {
	registerSchemaModule(GROUP_SCHEMA_NAME, IAM_MODULE);
	registerCrudService(GROUP_SCHEMA_NAME, groupService);

	const unsubscribers = [
		bus.subscribe(
			GroupCommands.SEARCH_ASSIGNED_ROLES,
			cmd => ra.searchAssignedRoles('groups', payload<ra.SearchAssignedRolesRequest>(cmd)),
		),
		bus.subscribe(
			GroupCommands.MANAGE_ROLE_ASSIGNMENTS,
			cmd => ra.manageRoleAssignments('groups', payload<ra.ManageRoleAssignmentsRequest>(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
