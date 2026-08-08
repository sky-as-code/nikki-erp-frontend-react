import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { userService } from './userService';
import { IAM_MODULE, USER_SCHEMA_NAME } from '../../constants';
import * as ra from '../roleAssignment';


const PREFIX = `${IAM_MODULE}.${USER_SCHEMA_NAME}`;

/** The status each contextual action moves the user to. */
const STATUS_BY_ACTION = { activate: 'active', invite: 'invited', suspend: 'suspended' } as const;

/**
 * Command names for the user resource.
 *
 * The CRUD names come from the schema-driven generic path (`core.resource.iam_user.*`),
 * served by the Shell's single prefix subscription — this module subscribes none of
 * them.
 *
 * The remaining four are genuinely not CRUD over `iam_user`:
 * - `SEARCH_ASSIGNED_ROLES` / `MANAGE_ROLE_ASSIGNMENTS` hit role-assignment endpoints
 *   the dynamic schema cannot express.
 * - `ACTIVATE` / `INVITE` / `SUSPEND` are `update` carrying a fixed `status`. They keep
 *   dedicated names because the detail template's contextual actions send only the
 *   record's `{id, etag}` — its props carry no payload — so the status value has
 *   nowhere else to travel.
 */
export const UserCommands = Object.freeze({
	...resourceCommands(USER_SCHEMA_NAME),
	ACTIVATE: `${PREFIX}.activate_user`,
	INVITE: `${PREFIX}.invite_user`,
	SUSPEND: `${PREFIX}.suspend_user`,
	MANAGE_ROLE_ASSIGNMENTS: `${PREFIX}.manage_user_role_assignments`,
	SEARCH_ASSIGNED_ROLES: `${PREFIX}.search_user_assigned_roles`,
} as const);

/**
 * Registers the user service and subscribes the non-CRUD handlers. Called
 * synchronously during the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerUserCommands(bus: ICommandBus): () => void {
	registerSchemaModule(USER_SCHEMA_NAME, IAM_MODULE);
	registerCrudService(USER_SCHEMA_NAME, userService);

	const unsubscribers = [
		bus.subscribe(UserCommands.ACTIVATE, cmd => setStatus('activate', cmd)),
		bus.subscribe(UserCommands.INVITE, cmd => setStatus('invite', cmd)),
		bus.subscribe(UserCommands.SUSPEND, cmd => setStatus('suspend', cmd)),
		bus.subscribe(
			UserCommands.SEARCH_ASSIGNED_ROLES,
			cmd => ra.searchAssignedRoles('users', payload<ra.SearchAssignedRolesRequest>(cmd)),
		),
		bus.subscribe(
			UserCommands.MANAGE_ROLE_ASSIGNMENTS,
			cmd => ra.manageRoleAssignments('users', payload<ra.ManageRoleAssignmentsRequest>(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function setStatus(action: keyof typeof STATUS_BY_ACTION, command: Command) {
	const request = payload<dyn.RestMutateOneRequest>(command);
	return userService.update({ ...request, status: STATUS_BY_ACTION[action] });
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
