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
		scopeRef: dto.scopeRef || undefined,
		orgId: dto.orgId || '',
		createdAt: dto.createdAt || new Date().toISOString(),
		updatedAt: dto.createdAt || new Date().toISOString(),
		createdBy: '',
		etag: dto.etag,
		assignmentsCount: dto.assignmentsCount || 0,
		rolesCount: dto.rolesCount || 0,
	};
}

function mapEntitlementToDto(entitlement: Partial<Entitlement>): Partial<AuthzEntitlementDto> {
	const dto: Partial<AuthzEntitlementDto> = {
		name: entitlement.name,
		actionId: entitlement.actionId,
		resourceId: entitlement.resourceId,
	};

	// Only include description if it's not undefined and not empty string
	if (entitlement.description !== undefined && entitlement.description !== '') {
		dto.description = entitlement.description;
	}
	if (entitlement.scopeRef) {
		dto.scopeRef = entitlement.scopeRef;
	}
	if (entitlement.orgId) {
		dto.orgId = entitlement.orgId;
	}

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
		entitlement: Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
	): Promise<Entitlement> {
		const dto = await createEntitlementApi(mapEntitlementToDto(entitlement) as Omit<AuthzEntitlementDto, 'id' | 'createdAt' | 'etag'>);
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
