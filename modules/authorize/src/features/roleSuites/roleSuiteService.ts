
import {
	createRoleSuite as createRoleSuiteApi,
	deleteRoleSuite as deleteRoleSuiteApi,
	getRoleSuite as getRoleSuiteApi,
	listRoleSuites as listRoleSuitesApi,
	updateRoleSuite as updateRoleSuiteApi,
} from '../../services/authzService';

import type { RoleSuite } from './types';
import type { Org } from '@/features/identities';

import { OwnerType } from '@/features/roles';


function mapDtoToRoleSuite(dto: RoleSuite): RoleSuite {
	const org: Org | undefined = dto.org ? {
		id: dto.org.id,
		displayName: dto.org.displayName,
		slug: dto.org.slug || '',
		status: (dto.org.status as 'active' | 'archived') || 'active',
		legalName: dto.org.legalName,
		email: dto.org.email,
		phoneNumber: dto.org.phoneNumber,
		address: dto.org.address,
		etag: dto.org.etag,
		createdAt: dto.org.createdAt,
		updatedAt: dto.org.updatedAt,
		deletedAt: dto.org.deletedAt,
	} : undefined;

	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		ownerType: (dto.ownerType as OwnerType) || OwnerType.USER,
		ownerRef: dto.ownerRef,
		isRequestable: dto.isRequestable ?? false,
		isRequiredAttachment: dto.isRequiredAttachment ?? false,
		isRequiredComment: dto.isRequiredComment ?? false,
		orgId: dto.org?.id,
		orgDisplayName: dto.org?.displayName,
		org,
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt,
		createdBy: dto.createdBy,
		etag: dto.etag,
		rolesCount: dto.rolesCount,
		ownerName: dto.ownerName,
		roles: dto.roles as any,
	};
}

export const roleSuiteService = {
	async listRoleSuites(
		params?: {
			graph?: Record<string, unknown>;
			page?: number;
			size?: number;
		},
	): Promise<RoleSuite[]> {
		const result = await listRoleSuitesApi(params);
		return result.items.map(mapDtoToRoleSuite);
	},

	async getRoleSuite(id: string): Promise<RoleSuite | undefined> {
		const dto = await getRoleSuiteApi(id);
		return mapDtoToRoleSuite(dto);
	},

	async createRoleSuite(
		roleSuite: RoleSuite,
	): Promise<RoleSuite> {
		const dto = await createRoleSuiteApi(roleSuite);
		return mapDtoToRoleSuite(dto);
	},

	async updateRoleSuite(
		id: string,
		etag: string,
		data: { name?: string; description?: string | null; roleIds?: string[] },
	): Promise<RoleSuite> {
		const dtoData = { ...data } as Partial<RoleSuite>;
		const dto = await updateRoleSuiteApi(id, etag, dtoData);
		return mapDtoToRoleSuite(dto);
	},

	async deleteRoleSuite(id: string): Promise<void> {
		await deleteRoleSuiteApi(id);
	},
};

