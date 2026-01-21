import * as request from '@nikkierp/common/request';

import {
	Organization,
	SearchOrganizationResponse,
	CreateOrganizationRequest,
	CreateOrganizationResponse,
	UpdateOrganizationRequest,
	UpdateOrganizationResponse,
	DeleteOrganizationResponse,
} from './types';


export const organizationService = {
	async listOrganizations(): Promise<SearchOrganizationResponse> {
		const graph = JSON.stringify({
			order: [['created_at', 'desc']],
		});
		const response = await request.get<SearchOrganizationResponse>('identity/organizations', {
			searchParams: { graph },
		});
		return response;
	},

	async getOrganization(slug: string): Promise<Organization> {
		const response = await request.get<Organization>(`identity/organizations/${slug}`);
		return response;
	},

	async createOrganization(data: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
		const response = await request.post<CreateOrganizationResponse>('identity/organizations', { json: data });
		return response;
	},

	async updateOrganization(data: UpdateOrganizationRequest): Promise<UpdateOrganizationResponse> {
		const response = await request.put<UpdateOrganizationResponse>(`identity/organizations/${data.slug}`, { json: data });
		return response;
	},

	async deleteOrganization(slug: string): Promise<DeleteOrganizationResponse> {
		const response = await request.del<DeleteOrganizationResponse>(`identity/organizations/${slug}`);
		return response;
	},
};
