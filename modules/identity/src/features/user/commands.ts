import { Command, CommandResponse, ICommandBus, ok } from '@nikkierp/common/commandBus';

import * as svc from './userService';
import * as t from './types';
import { IAM_MODULE, USER_SCHEMA_NAME } from '../../constants';


const PREFIX = `${IAM_MODULE}.${USER_SCHEMA_NAME}`;

/** Command names handled by the identity user sub-module. */
export const USER_COMMANDS = {
	create: `${PREFIX}.create_user`,
	getById: `${PREFIX}.get_user_by_id`,
	search: `${PREFIX}.search_users`,
	update: `${PREFIX}.update_user`,
	delete: `${PREFIX}.delete_user`,
	setIsArchived: `${PREFIX}.set_user_is_archived`,
	activate: `${PREFIX}.activate_user`,
	suspend: `${PREFIX}.suspend_user`,
	invite: `${PREFIX}.invite_user`,
} as const;

/**
 * Subscribes the user command handlers onto the Shell-hosted bus. Called synchronously
 * during the micro-app `init` so lazy command resolution can find the handlers.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerUserCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(USER_COMMANDS.create, cmd => svc.createUser(payload<t.CreateUserRequest>(cmd))),
		bus.subscribe(USER_COMMANDS.getById, cmd => svc.getUserById(payload<t.GetUserByIdRequest>(cmd))),
		bus.subscribe(USER_COMMANDS.search, cmd => svc.searchUsers(payload<t.SearchUserRequest>(cmd))),
		bus.subscribe(USER_COMMANDS.update, cmd => svc.updateUser(payload<t.UpdateUserRequest>(cmd))),
		bus.subscribe(USER_COMMANDS.delete, handleDeleteUser),
		bus.subscribe(USER_COMMANDS.setIsArchived, cmd => svc.setUserIsArchived(payload<t.SetUserIsArchivedRequest>(cmd))),
		bus.subscribe(USER_COMMANDS.activate, cmd => svc.activateUser(payload<t.ActivateUserRequest>(cmd))),
		bus.subscribe(USER_COMMANDS.suspend, cmd => svc.suspendUser(payload<t.SuspendUserRequest>(cmd))),
		bus.subscribe(USER_COMMANDS.invite, cmd => svc.inviteUser(payload<t.InviteUserRequest>(cmd))),
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
