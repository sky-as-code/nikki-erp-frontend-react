import { Entitlement } from './types';
import {
	listEntitlements as listEntitlementsApi,
	getEntitlement as getEntitlementApi,
	createEntitlement as createEntitlementApi,
	updateEntitlement as updateEntitlementApi,
	deleteEntitlement as deleteEntitlementApi,
	type AuthzEntitlementDto,
} from '../../services/authzService';


function mapDtoToEntitlement(dto: AuthzEntitlementDto): Entitlement {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		actionId: dto.actionId,
		resourceId: dto.resourceId,
		actionExpr: dto.actionExpr,
		orgId: dto.orgId,
		createdAt: dto.createdAt,
		createdBy: dto.createdBy,
		etag: dto.etag,
		assignmentsCount: dto.assignmentsCount,
		rolesCount: dto.rolesCount,
	};
}

function mapEntitlementToDto(entitlement: Partial<Entitlement>): Partial<AuthzEntitlementDto> {
	const dto: Partial<AuthzEntitlementDto> = {
		name: entitlement.name,
		actionId: entitlement.actionId,
		resourceId: entitlement.resourceId,
		actionExpr: entitlement.actionExpr,
		orgId: entitlement.orgId,
		description: entitlement.description,
		createdBy: entitlement.createdBy,
	};

	return dto;
}

export const entitlementService = {
	async listEntitlements(): Promise<Entitlement[]> {
		const result = await listEntitlementsApi();
		return result.items.map(mapDtoToEntitlement);
	},

	async getEntitlement(id: string): Promise<Entitlement | undefined> {
		const dto = await getEntitlementApi(id);
		return mapDtoToEntitlement(dto);
	},

	async createEntitlement(
		entitlement: Omit<Entitlement, 'id' | 'createdAt' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
	): Promise<Entitlement> {
		const dto = await createEntitlementApi(mapEntitlementToDto(entitlement) as Omit<AuthzEntitlementDto, 'id' | 'createdAt' | 'etag' | 'assignmentsCount' | 'rolesCount'>);
		return mapDtoToEntitlement(dto);
	},

	async updateEntitlement(
		id: string,
		etag: string,
		data: { name?: string; description?: string | null },
	): Promise<Entitlement> {
		const dto = await updateEntitlementApi(id, etag, data);
		return mapDtoToEntitlement(dto);
	},

	async deleteEntitlement(id: string): Promise<void> {
		await deleteEntitlementApi(id);
	},
};
