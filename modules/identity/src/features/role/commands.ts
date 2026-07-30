import { Command, CommandResponse, ICommandBus, ok } from '@nikkierp/common/commandBus';

import * as svc from './roleService';
import * as t from './types';
import { IAM_MODULE, ROLE_SCHEMA_NAME } from '../../constants';


const PREFIX = `${IAM_MODULE}.${ROLE_SCHEMA_NAME}`;

/** Command names handled by the identity role sub-module. */
export const RoleCommands = Object.freeze({
	CREATE: `${PREFIX}.create_role`,
	DELETE: `${PREFIX}.delete_role`,
	GET_BY_ID: `${PREFIX}.get_role_by_id`,
	MANAGE_ENTITLEMENTS: `${PREFIX}.manage_role_entitlements`,
	SEARCH: `${PREFIX}.search_roles`,
	SET_IS_ARCHIVED: `${PREFIX}.set_role_is_archived`,
	UPDATE: `${PREFIX}.update_role`,
} as const);

export function registerRoleCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(RoleCommands.CREATE, cmd => svc.createRole(payload<t.CreateRoleRequest>(cmd))),
		bus.subscribe(RoleCommands.GET_BY_ID, cmd => svc.getRoleById(payload<t.GetRoleByIdRequest>(cmd))),
		bus.subscribe(RoleCommands.SEARCH, cmd => svc.searchRoles(payload<t.SearchRolesRequest>(cmd))),
		bus.subscribe(RoleCommands.UPDATE, cmd => svc.updateRole(payload<t.UpdateRoleRequest>(cmd))),
		bus.subscribe(
			RoleCommands.MANAGE_ENTITLEMENTS,
			cmd => svc.manageRoleEntitlements(payload<t.ManageRoleEntitlementsRequest>(cmd)),
		),
		bus.subscribe(
			RoleCommands.SET_IS_ARCHIVED,
			cmd => svc.setRoleIsArchived(payload<t.SetRoleIsArchivedRequest>(cmd)),
		),
		bus.subscribe(RoleCommands.DELETE, handleDeleteRole),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}

/** Supports both single-item (`{ id }`) and bulk list (`{ ids: [] }`) delete payloads. */
async function handleDeleteRole(command: Command): Promise<CommandResponse<t.DeleteRoleResponse[], unknown>> {
	const raw = command.payload as { id?: string, ids?: string[] };
	const ids = Array.isArray(raw?.ids) ? raw.ids : raw?.id ? [raw.id] : [];
	const responses: t.DeleteRoleResponse[] = [];
	for (const id of ids) {
		const result = await svc.deleteRole({ id });
		if (result.error) {
			return result as CommandResponse<t.DeleteRoleResponse[], unknown>;
		}
		responses.push(result.data as t.DeleteRoleResponse);
	}
	return ok(responses);
}
