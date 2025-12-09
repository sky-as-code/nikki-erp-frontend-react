import { OwnerType } from '@/features/roles';

import {
	createRoleSuite as createRoleSuiteApi,
	deleteRoleSuite as deleteRoleSuiteApi,
	getRoleSuite as getRoleSuiteApi,
	listRoleSuites as listRoleSuitesApi,
	updateRoleSuite as updateRoleSuiteApi,
	type AuthzRoleSuiteDto,
} from '../../services/authzService';

import type { RoleSuite } from './types';


function mapDtoToRoleSuite(dto: AuthzRoleSuiteDto): RoleSuite {
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
		rolesCount: dto.rolesCount,
		ownerName: dto.ownerName,
		roles: dto.roles as any,
	};
}

function mapRoleSuiteToDto(roleSuite: Partial<RoleSuite>): Partial<AuthzRoleSuiteDto> {
	const dto: Partial<AuthzRoleSuiteDto> = {
		name: roleSuite.name,
		ownerType: roleSuite.ownerType,
		ownerRef: roleSuite.ownerRef,
		isRequestable: roleSuite.isRequestable ?? false,
		isRequiredAttachment: roleSuite.isRequiredAttachment ?? false,
		isRequiredComment: roleSuite.isRequiredComment ?? false,
		createdBy: roleSuite.createdBy,
	};

	if (roleSuite.description !== undefined && roleSuite.description !== '') {
		dto.description = roleSuite.description;
	}

	if (roleSuite.orgId !== undefined && roleSuite.orgId !== '') {
		dto.orgId = roleSuite.orgId;
	}

	if (roleSuite.roles) {
		dto.roles = roleSuite.roles.map((r) => ({ id: r.id, name: r.name, orgId: r.orgId }));
	}

	return dto;
}

export const roleSuiteService = {
	async listRoleSuites(): Promise<RoleSuite[]> {
		const result = await listRoleSuitesApi();
		return result.items.map(mapDtoToRoleSuite);
	},

	async getRoleSuite(id: string): Promise<RoleSuite | undefined> {
		const dto = await getRoleSuiteApi(id);
		return mapDtoToRoleSuite(dto);
	},

	async createRoleSuite(
		roleSuite: Omit<RoleSuite, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'rolesCount' | 'ownerName'>,
	): Promise<RoleSuite> {
		const dto = await createRoleSuiteApi(mapRoleSuiteToDto(roleSuite) as Omit<AuthzRoleSuiteDto, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'rolesCount' | 'ownerName'>);
		return mapDtoToRoleSuite(dto);
	},

	async updateRoleSuite(
		id: string,
		etag: string,
		data: { name?: string; description?: string | null; roles?: string[] },
	): Promise<RoleSuite> {
		const dtoData: any = { ...data };
		if (data.roles) {
			dtoData.roles = data.roles.map((r) => ({ id: r }));
		}
		const dto = await updateRoleSuiteApi(id, etag, dtoData);
		return mapDtoToRoleSuite(dto);
	},

	async deleteRoleSuite(id: string): Promise<void> {
		await deleteRoleSuiteApi(id);
	},
};

