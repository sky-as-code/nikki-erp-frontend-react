import { Entitlement } from './types';
import {
	listEntitlements as listEntitlementsApi,
	getEntitlement as getEntitlementApi,
	getEntitlementsByIds as getEntitlementsByIdsApi,
	createEntitlement as createEntitlementApi,
	updateEntitlement as updateEntitlementApi,
	deleteEntitlement as deleteEntitlementApi,
	type AuthzActionDto,
	type AuthzEntitlementDto,
	type AuthzResourceDto,
} from '../../services/authzService';
import { Action } from '../actions/types';
import { Resource, ResourceType } from '../resources/types';
import { ScopeType } from '../resources/types';


function mapDtoToAction(dto: AuthzActionDto | undefined): Action | undefined {
	if (!dto) return undefined;
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		resourceId: dto.resourceId,
		createdBy: dto.createdBy,
		etag: dto.etag,
		createdAt: dto.createdAt,
	};
}

function mapDtoToResource(dto: AuthzResourceDto | undefined): Resource | undefined {
	if (!dto) return undefined;
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		resourceType: dto.resourceType as ResourceType,
		resourceRef: dto.resourceRef,
		scopeType: dto.scopeType as ScopeType,
		createdAt: dto.createdAt,
		etag: dto.etag,
	};
}

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
		scopeRef: dto.scopeRef,
		// Map populated action and resource from API response
		action: mapDtoToAction(dto.action as AuthzActionDto | undefined),
		resource: mapDtoToResource(dto.resource as AuthzResourceDto | undefined),
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

	async getEntitlementsByIds(ids: string[]): Promise<Entitlement[]> {
		const dto = await getEntitlementsByIdsApi(ids);
		return dto.map(mapDtoToEntitlement);
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
