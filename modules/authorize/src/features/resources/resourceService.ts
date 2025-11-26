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
		updatedAt: dto.updatedAt || new Date().toISOString(),
		createdBy: dto.createdBy || '',
		etag: dto.etag,
		actions: dto.actions?.map((action) => ({
			id: action.id,
			name: action.name,
			description: action.description,
			resourceId: action.resourceId,
			createdAt: '',
			updatedAt: '',
			createdBy: '',
		})) || [],
		actionsCount: dto.actionsCount || dto.actions?.length || 0,
	};
}

function mapResourceToDto(resource: Partial<Resource>): Partial<AuthzResourceDto> {
	return {
		name: resource.name,
		description: resource.description,
		resourceType: resource.resourceType,
		resourceRef: resource.resourceRef,
		scopeType: resource.scopeType,
	};
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

	async createResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'actions' | 'actionsCount'>): Promise<Resource> {
		const dto = await createResourceApi(mapResourceToDto(resource) as Omit<AuthzResourceDto, 'id' | 'createdAt' | 'updatedAt' | 'etag'>);
		return mapDtoToResource(dto);
	},

	async updateResource(
		id: string,
		resource: Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'actions' | 'actionsCount'>>,
		etag?: string,
	): Promise<Resource> {
		const dto = await updateResourceApi(id, mapResourceToDto(resource), etag);
		return mapDtoToResource(dto);
	},

	async deleteResource(name: string): Promise<void> {
		await deleteResourceApi(name);
	},
};
