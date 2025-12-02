import { Role, OwnerType } from './types';
import {
	createRole as createRoleApi,
	deleteRole as deleteRoleApi,
	getRole as getRoleApi,
	listRoles as listRolesApi,
	updateRole as updateRoleApi,
	type AuthzRoleDto,
} from '../../services/authzService';


function mapDtoToRole(dto: AuthzRoleDto): Role {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		ownerType: (dto.ownerType as OwnerType) || OwnerType.USER,
		ownerRef: dto.ownerRef,
		isRequestable: dto.isRequestable ?? false,
		isRequiredAttachment: dto.isRequiredAttachment ?? false,
		isRequiredComment: dto.isRequiredComment ?? false,
		orgId: dto.orgId,
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt,
		createdBy: dto.createdBy,
		etag: dto.etag,
		entitlementsCount: dto.entitlementsCount,
		assignmentsCount: dto.assignmentsCount,
		suitesCount: dto.suitesCount,
		ownerName: dto.ownerName,
	};
}

function mapRoleToDto(role: Partial<Role>): Partial<AuthzRoleDto> {
	const dto: Partial<AuthzRoleDto> = {
		name: role.name,
		ownerType: role.ownerType,
		ownerRef: role.ownerRef,
		isRequestable: role.isRequestable ?? false,
		isRequiredAttachment: role.isRequiredAttachment ?? false,
		isRequiredComment: role.isRequiredComment ?? false,
		createdBy: role.createdBy,
	};

	if (role.description !== undefined && role.description !== '') {
		dto.description = role.description;
	}

	if (role.orgId !== undefined && role.orgId !== '') {
		dto.orgId = role.orgId;
	}

	return dto;
}

export const roleService = {
	async listRoles(): Promise<Role[]> {
		const result = await listRolesApi();
		return result.items.map(mapDtoToRole);
	},

	async getRole(id: string): Promise<Role | undefined> {
		const dto = await getRoleApi(id);
		return mapDtoToRole(dto);
	},

	async createRole(
		role: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'entitlementsCount' | 'assignmentsCount' | 'suitesCount' | 'ownerName'>,
	): Promise<Role> {
		const dto = await createRoleApi(mapRoleToDto(role) as Omit<AuthzRoleDto, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'entitlementsCount' | 'assignmentsCount' | 'suitesCount' | 'ownerName'>);
		return mapDtoToRole(dto);
	},

	async updateRole(
		id: string,
		etag: string,
		data: { name?: string; description?: string | null },
	): Promise<Role> {
		const dto = await updateRoleApi(id, etag, data);
		return mapDtoToRole(dto);
	},

	async deleteRole(id: string): Promise<void> {
		await deleteRoleApi(id);
	},
};

