import { Command, CommandResponse, ICommandBus, ok } from '@nikkierp/common/commandBus';

import * as t from './types';
import * as svc from './userService';
import { IAM_MODULE, USER_SCHEMA_NAME } from '../../constants';
import * as ra from '../roleAssignment';


const PREFIX = `${IAM_MODULE}.${USER_SCHEMA_NAME}`;

/** Command names handled by the identity user sub-module. */
export const UserCommands = Object.freeze({
	ACTIVATE: `${PREFIX}.activate_user`,
	CREATE: `${PREFIX}.create_user`,
	DELETE: `${PREFIX}.delete_user`,
	GET_BY_ID: `${PREFIX}.get_user_by_id`,
	INVITE: `${PREFIX}.invite_user`,
	MANAGE_ROLE_ASSIGNMENTS: `${PREFIX}.manage_user_role_assignments`,
	SEARCH_ASSIGNED_ROLES: `${PREFIX}.search_user_assigned_roles`,
	SET_IS_ARCHIVED: `${PREFIX}.set_user_is_archived`,
	SUSPEND: `${PREFIX}.suspend_user`,
	SEARCH: `${PREFIX}.search_users`,
	UPDATE: `${PREFIX}.update_user`,
} as const);

/**
 * Subscribes the user command handlers onto the Shell-hosted bus. Called synchronously
 * during the micro-app `init` so lazy command resolution can find the handlers.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerUserCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(UserCommands.CREATE, cmd => svc.createUser(payload<t.CreateUserRequest>(cmd))),
		bus.subscribe(UserCommands.GET_BY_ID, cmd => svc.getUserById(payload<t.GetUserByIdRequest>(cmd))),
		bus.subscribe(UserCommands.SEARCH, cmd => svc.searchUsers(payload<t.SearchUserRequest>(cmd))),
		bus.subscribe(UserCommands.UPDATE, cmd => svc.updateUser(payload<t.UpdateUserRequest>(cmd))),
		bus.subscribe(UserCommands.DELETE, handleDeleteUser),
		bus.subscribe(
			UserCommands.SET_IS_ARCHIVED,
			cmd => svc.setUserIsArchived(payload<t.SetUserIsArchivedRequest>(cmd)),
		),
		bus.subscribe(UserCommands.ACTIVATE, cmd => svc.activateUser(payload<t.ActivateUserRequest>(cmd))),
		bus.subscribe(UserCommands.SUSPEND, cmd => svc.suspendUser(payload<t.SuspendUserRequest>(cmd))),
		bus.subscribe(UserCommands.INVITE, cmd => svc.inviteUser(payload<t.InviteUserRequest>(cmd))),
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

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}

/** Supports both single-item (`{ id }`) and bulk list (`{ ids: [] }`) delete payloads. */
async function handleDeleteUser(command: Command): Promise<CommandResponse<t.DeleteUserResponse[], unknown>> {
	const raw = command.payload as { id?: string, ids?: string[] };
	const ids = Array.isArray(raw?.ids) ? raw.ids : raw?.id ? [raw.id] : [];
	const responses: t.DeleteUserResponse[] = [];
	for (const id of ids) {
		const result = await svc.deleteUser({ id });
		if (result.error) {
			return result as CommandResponse<t.DeleteUserResponse[], unknown>;
		}
		responses.push(result.data as t.DeleteUserResponse);
	}
	return ok(responses);
}
