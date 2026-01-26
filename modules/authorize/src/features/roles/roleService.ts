import { Role } from './types';
import {
	addEntitlementsToRole as addEntitlementsToRoleApi,
	createRole as createRoleApi,
	deleteRole as deleteRoleApi,
	getRole as getRoleApi,
	listRoles as listRolesApi,
	removeEntitlementsFromRole as removeEntitlementsFromRoleApi,
	updateRole as updateRoleApi,
} from '../../services/authzService';


function configFields(dto: Role): Role {
	return {
		...dto,
		entitlementsCount: dto.entitlementsCount || dto.entitlements?.length || 0,
	};
}

export const roleService = {
	async listRoles(
		params?: {
			graph?: Record<string, unknown>;
			page?: number;
			size?: number;
		},
	): Promise<Role[]> {
		const result = await listRolesApi(params);
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

