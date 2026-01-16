import { Resource } from './types';
import {
	createResource as createResourceApi,
	deleteResource as deleteResourceApi,
	getResource as getResourceApi,
	listResources as listResourcesApi,
	updateResource as updateResourceApi,
} from '../../services/authzService';


function configFields(dto: Resource): Resource {
	return {
		...dto,
		actionsCount: dto.actionsCount || dto.actions?.length || 0,
	};
}

export const resourceService = {
	async listResources(): Promise<Resource[]> {
		const result = await listResourcesApi({
			withActions: true,
		} as Parameters<typeof listResourcesApi>[0]);
		return result.items.map(configFields);
	},

	async getResource(name: string): Promise<Resource | undefined> {
		const dto = await getResourceApi(name);
		return configFields(dto);
	},

	async createResource(resource: Resource): Promise<Resource> {
		const result = await createResourceApi(resource);
		return result;
	},

	async updateResource(
		id: string,
		etag: string,
		description?: string | null,
	): Promise<Resource> {
		const dto = await updateResourceApi(id, etag, description);
		return configFields(dto);
	},

	async deleteResource(name: string): Promise<void> {
		await deleteResourceApi(name);
	},
};
