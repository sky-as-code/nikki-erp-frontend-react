import { Command, CommandResponse, ICommandBus, ok } from '@nikkierp/common/commandBus';

import * as svc from './groupService';
import * as t from './types';
import { GROUP_SCHEMA_NAME, IAM_MODULE } from '../../constants';
import * as ra from '../roleAssignment';


const PREFIX = `${IAM_MODULE}.${GROUP_SCHEMA_NAME}`;

/** Command names handled by the identity group sub-module. */
export const GroupCommands = Object.freeze({
	CREATE: `${PREFIX}.create_group`,
	DELETE: `${PREFIX}.delete_group`,
	GET_BY_ID: `${PREFIX}.get_group_by_id`,
	MANAGE_ROLE_ASSIGNMENTS: `${PREFIX}.manage_group_role_assignments`,
	SEARCH: `${PREFIX}.search_groups`,
	SEARCH_ASSIGNED_ROLES: `${PREFIX}.search_group_assigned_roles`,
	UPDATE: `${PREFIX}.update_group`,
} as const);

export function registerGroupCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(GroupCommands.CREATE, cmd => svc.createGroup(payload<t.CreateGroupRequest>(cmd))),
		bus.subscribe(GroupCommands.GET_BY_ID, cmd => svc.getGroupById(payload<t.GetGroupByIdRequest>(cmd))),
		bus.subscribe(GroupCommands.SEARCH, cmd => svc.searchGroups(payload<t.SearchGroupsRequest>(cmd))),
		bus.subscribe(GroupCommands.UPDATE, cmd => svc.updateGroup(payload<t.UpdateGroupRequest>(cmd))),
		bus.subscribe(
			GroupCommands.SEARCH_ASSIGNED_ROLES,
			cmd => ra.searchAssignedRoles('groups', payload<ra.SearchAssignedRolesRequest>(cmd)),
		),
		bus.subscribe(
			GroupCommands.MANAGE_ROLE_ASSIGNMENTS,
			cmd => ra.manageRoleAssignments('groups', payload<ra.ManageRoleAssignmentsRequest>(cmd)),
		),
		bus.subscribe(GroupCommands.DELETE, handleDeleteGroup),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}

async function handleDeleteGroup(command: Command): Promise<CommandResponse<t.DeleteGroupResponse[], unknown>> {
	const raw = command.payload as { id?: string, ids?: string[] };
	const ids = Array.isArray(raw?.ids) ? raw.ids : raw?.id ? [raw.id] : [];
	const responses: t.DeleteGroupResponse[] = [];
	for (const id of ids) {
		const result = await svc.deleteGroup({ id });
		if (result.error) {
			return result as CommandResponse<t.DeleteGroupResponse[], unknown>;
		}
		responses.push(result.data as t.DeleteGroupResponse);
	}
	return ok(responses);
}
