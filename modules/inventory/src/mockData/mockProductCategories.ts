import type { ProductCategory } from '../features/productCategory/types';


const createdAt = '2026-01-08T08:00:00.000Z';

export const mockProductCategoriesData: ProductCategory[] = [
	{
		id: 'cat-1',
		orgId: 'org-1',
		name: { en: 'All Products' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-1',
	},
	{
		id: 'cat-2',
		orgId: 'org-1',
		name: { en: 'Electronics' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-2',
	},
	{
		id: 'cat-3',
		orgId: 'org-1',
		name: { en: 'Laptops' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-3',
	},
	{
		id: 'cat-4',
		orgId: 'org-1',
		name: { en: 'Phone Accessories' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-4',
	},
	{
		id: 'cat-5',
		orgId: 'org-1',
		name: { en: 'Furniture' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-5',
	},
	{
		id: 'cat-6',
		orgId: 'org-1',
		name: { en: 'Chairs' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-6',
	},
	{
		id: 'cat-7',
		orgId: 'org-1',
		name: { en: 'Tables' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-7',
	},
	{
		id: 'cat-8',
		orgId: 'org-1',
		name: { en: 'Consumables' },
		createdAt,
		updatedAt: createdAt,
		etag: 'etag-cat-8',
	},
];
