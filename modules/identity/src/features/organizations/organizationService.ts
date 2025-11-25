import * as request from '@nikkierp/common/request';

import {
	Organization,
	SearchOrganizationsResponse,
	CreateOrganizationRequest,
	CreateOrganizationResponse,
	UpdateOrganizationRequest,
	DeleteOrganizationResponse,
} from './types';


export const organizationService = {
	async listOrganizations(): Promise<Organization[]> {
		const response = await request.get<SearchOrganizationsResponse>('identity/organizations');
		return response.items;
	},

	async getOrganization(slug: string): Promise<Organization | undefined> {
		try {
			const response = await request.get<Organization>(`identity/organizations/${slug}`);
			return response;
		}
		catch (error) {
			console.error('Failed to get organization:', error);
			return undefined;
		}
	},

	async createOrganization(data: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
		const response = await request.post<CreateOrganizationResponse>('identity/organizations', { json: data });
		return response;
	},

	async updateOrganization(slug: string, data: UpdateOrganizationRequest): Promise<Organization> {
		const response = await request.put<Organization>(`identity/organizations/${slug}`, { json: data });
		return response;
	},

	async deleteOrganization(slug: string): Promise<DeleteOrganizationResponse> {
		const response = await request.del<DeleteOrganizationResponse>(`identity/organizations/${slug}`);
		return response;
	},
};
