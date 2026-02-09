import type { UnitCategory } from '../features/unitCategory/types';


const createdAt = '2026-01-08T08:00:00.000Z';

export const mockUnitCategoriesData: UnitCategory[] = [
	{
		id: 'ucat-1',
		orgId: 'org-1',
		name: 'General',
		description: 'General unit category.',
		status: 'active',
		thumbnailURL: '',
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-ucat-1',
	},
	{
		id: 'ucat-2',
		orgId: 'org-1',
		name: 'Quantity',
		description: 'Units used to measure count or quantity of items.',
		status: 'active',
		thumbnailURL: '',
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-ucat-2',
	},
	{
		id: 'ucat-3',
		orgId: 'org-1',
		name: 'Weight',
		description: 'Units used to measure weight or mass.',
		status: 'active',
		thumbnailURL: '',
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-ucat-3',
	},
	{
		id: 'ucat-4',
		orgId: 'org-1',
		name: 'Volume',
		description: 'Units used to measure liquid or gas volume.',
		status: 'active',
		thumbnailURL: '',
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-ucat-4',
	},
];
