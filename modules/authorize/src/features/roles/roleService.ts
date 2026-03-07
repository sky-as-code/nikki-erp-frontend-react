import { Role } from './types';
import {
	addEntitlementsToRole as addEntitlementsToRoleApi,
	createRole as createRoleApi,
	deleteRole as deleteRoleApi,
	getRole as getRoleApi,
	ListQuery,
	listRoles as listRolesApi,
	removeEntitlementsFromRole as removeEntitlementsFromRoleApi,
	updateRole as updateRoleApi,
} from '../../services/authzService';


function configFields(dto: Role): Role {
	const resolvedOrgId = dto.orgId ?? dto.org?.id;
	const resolvedOrgDisplayName = dto.orgDisplayName ?? dto.org?.displayName;
	return {
		...dto,
		orgId: resolvedOrgId,
		orgDisplayName: resolvedOrgDisplayName,
		entitlementsCount: dto.entitlementsCount || dto.entitlements?.length || 0,
	};
}

export const roleService = {
	async listRoles(
		listQuery?: ListQuery,
		orgId?: string | null,
		includeDomainInOrg?: boolean,
	): Promise<Role[]> {
		const graph: Record<string, unknown> = {
			...listQuery?.graph,
			order: [['id', 'asc']],
		};
		if (orgId !== undefined) {
			if (orgId === null) {
				graph.if = ['org_id', 'not_set', 'null'];
			}
			else if (includeDomainInOrg) {
				graph.or = [
					{ if: ['org_id', '=', orgId] },
					{ if: ['org_id', 'not_set', 'null'] },
				];
			}
			else {
				graph.if = ['org_id', '=', orgId];
			}
		}
		const result = await listRolesApi({
			...listQuery,
			graph,
		});
		return result.items.map(configFields);
	},

	async getRole(id: string): Promise<Role | undefined> {
		const dto = await getRoleApi(id);
		return configFields(dto);
	},

	async createRole(
		role: Role,
	): Promise<Role> {
		const dto = await createRoleApi(role);
		return configFields(dto);
	},

	async updateRole(
		id: string,
		etag: string,
		data: Role,
	): Promise<Role> {
		const dto = await updateRoleApi(id, etag, data);
		return configFields(dto);
	},

	async deleteRole(id: string): Promise<void> {
		await deleteRoleApi(id);
	},

	async addEntitlementsToRole(
		roleId: string,
		etag: string,
		entitlementInputs: Array<{ entitlementId: string; scopeRef?: string }>,
	): Promise<void> {
		await addEntitlementsToRoleApi(roleId, {
			entitlementInputs,
			etag,
		});
	},

	async removeEntitlementsFromRole(
		roleId: string,
		etag: string,
		entitlementInputs: Array<{ entitlementId: string; scopeRef?: string }>,
	): Promise<void> {
		await removeEntitlementsFromRoleApi(roleId, {
			entitlementInputs,
			etag,
		});
	},
};

