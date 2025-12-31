import type { Org } from './types';


/**
 * Mock data for organizations
 * Replace with API call when available
 */
export const MOCK_ORGS: Org[] = [
	{
		id: '01JWNY20G23KD4RV5VWYABQYHD',
		displayName: 'My Company',
		legalName: '',
		email: '',
		phoneNumber: '',
		address: '',
		status: 'active',
		slug: 'my-company',
		etag: '1764651081483868000',
		createdAt: '2025-12-02T04:51:21.480187+00:00',
	},
	{
		id: '01K02G6J1CYAN9K8V4PAGSQ5Z8',
		displayName: 'Old Company',
		legalName: '',
		email: '',
		phoneNumber: '',
		address: '',
		status: 'archived',
		slug: 'old-company',
		etag: '1764651081483933000',
		createdAt: '2025-12-02T04:51:21.480187+00:00',
	},
];

