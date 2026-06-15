import { Command, CommandResponse, ICommandBus, ok } from '@nikkierp/common/commandBus';

import * as t from './types';
import * as svc from './orgService';
import { IAM_MODULE, ORGANIZATION_SCHEMA_NAME } from '../../constants';


const PREFIX = `${IAM_MODULE}.${ORGANIZATION_SCHEMA_NAME}`;

/** Command names handled by the identity organization sub-module. */
export const OrganizationCommands = Object.freeze({
	CREATE: `${PREFIX}.create_organization`,
	DELETE: `${PREFIX}.delete_organization`,
	GET_BY_ID: `${PREFIX}.get_organization_by_id`,
	SEARCH: `${PREFIX}.search_organizations`,
	SET_IS_ARCHIVED: `${PREFIX}.set_organization_is_archived`,
	UPDATE: `${PREFIX}.update_organization`,
} as const);

export function registerOrganizationCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(OrganizationCommands.CREATE, cmd => svc.createOrg(payload<t.CreateOrgRequest>(cmd))),
		bus.subscribe(OrganizationCommands.GET_BY_ID, cmd => svc.getOrgById(payload<t.GetOrgByIdRequest>(cmd))),
		bus.subscribe(OrganizationCommands.SEARCH, cmd => svc.searchOrgs(payload<t.SearchOrgRequest>(cmd))),
		bus.subscribe(OrganizationCommands.UPDATE, cmd => svc.updateOrg(payload<t.UpdateOrgRequest>(cmd))),
		bus.subscribe(OrganizationCommands.DELETE, handleDeleteOrganization),
		bus.subscribe(
			OrganizationCommands.SET_IS_ARCHIVED,
			cmd => svc.setOrgIsArchived(payload<t.SetOrgIsArchivedRequest>(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}

async function handleDeleteOrganization(
	command: Command,
): Promise<CommandResponse<t.DeleteOrgResponse[], unknown>> {
	const raw = command.payload as { id?: string, ids?: string[] };
	const ids = Array.isArray(raw?.ids) ? raw.ids : raw?.id ? [raw.id] : [];
	const responses: t.DeleteOrgResponse[] = [];
	for (const id of ids) {
		const result = await svc.deleteOrg({ id });
		if (result.error) {
			return result as CommandResponse<t.DeleteOrgResponse[], unknown>;
		}
		responses.push(result.data as t.DeleteOrgResponse);
	}
	return ok(responses);
}
