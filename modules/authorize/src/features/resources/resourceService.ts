import { Resource, ResourceType, ScopeType } from './types';
import {
	createResource as createResourceApi,
	deleteResource as deleteResourceApi,
	getResource as getResourceApi,
	listResources as listResourcesApi,
	updateResource as updateResourceApi,
	type AuthzResourceDto,
} from '../../services/authzService';



function mapDtoToResource(dto: AuthzResourceDto): Resource {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		resourceType: (dto.resourceType as ResourceType) || ResourceType.CUSTOM,
		resourceRef: dto.resourceRef,
		scopeType: (dto.scopeType as ScopeType) || ScopeType.ORG,
		createdAt: dto.createdAt || new Date().toISOString(),
		etag: dto.etag,
		actions: dto.actions?.map((action) => ({
			id: action.id,
			name: action.name,
			description: action.description,
			resourceId: action.resourceId,
			createdAt: action.createdAt,
			etag: action.etag,
			createdBy: action.createdBy,
			entitlementsCount: action.entitlementsCount || 0,
		})) || [],
		actionsCount: dto.actionsCount || dto.actions?.length || 0,
	};
}

function mapResourceToDto(resource: Partial<Resource>): Partial<AuthzResourceDto> {
	const dto: Partial<AuthzResourceDto> = {
		name: resource.name,
		resourceType: resource.resourceType,
		resourceRef: resource.resourceRef,
		scopeType: resource.scopeType,
	};

	if (resource.description !== undefined && resource.description !== '') {
		dto.description = resource.description;
	}

	return dto;
}

export const resourceService = {
	async listResources(): Promise<Resource[]> {
		const result = await listResourcesApi({
			withActions: true,
		} as Parameters<typeof listResourcesApi>[0]);
		return result.items.map(mapDtoToResource);
	},

	async getResource(name: string): Promise<Resource | undefined> {
		const dto = await getResourceApi(name);
		return mapDtoToResource(dto);
	},

	async createResource(resource: Omit<Resource, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>): Promise<Resource> {
		const dto = await createResourceApi(mapResourceToDto(resource) as Omit<AuthzResourceDto, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>);
		return mapDtoToResource(dto);
	},

	async updateResource(
		id: string,
		etag: string,
		description?: string | null,
	): Promise<Resource> {
		const dto = await updateResourceApi(id, etag, description);
		return mapDtoToResource(dto);
	},

	async deleteResource(name: string): Promise<void> {
		await deleteResourceApi(name);
	},
};
