export type AttributeGroup = {
	id: string;
	productId: string;
	name: string | Record<string, string>;
	index: number;
	createdAt: string;
	updatedAt: string;
	etag: string;
};


const timestamp = '2026-01-03T07:30:00.000Z';

export const mockAttributeGroupsData: AttributeGroup[] = [
	{
		id: 'grp-1',
		productId: 'prod-1',
		name: { en: 'Variant Options' },
		index: 10,
		createdAt: timestamp,
		updatedAt: timestamp,
		etag: 'etag-grp-1',
	},
	{
		id: 'grp-2',
		productId: 'prod-2',
		name: { en: 'Material Options' },
		index: 20,
		createdAt: timestamp,
		updatedAt: timestamp,
		etag: 'etag-grp-2',
	},
	{
		id: 'grp-3',
		productId: 'prod-3',
		name: { en: 'Flavor & Capacity' },
		index: 30,
		createdAt: timestamp,
		updatedAt: timestamp,
		etag: 'etag-grp-3',
	},
];
