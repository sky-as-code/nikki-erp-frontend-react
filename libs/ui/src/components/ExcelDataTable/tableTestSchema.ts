import type * as dyn from '@nikkierp/common/dynamicModel';


/** A row schema for the component tests; free of imports so a `vi.mock` factory can load it. */
export const testSchema = {
	name: 'test_line',
	fields: {
		id: { name: 'id', data_type: { name: 'ulid' }, is_primary_key: true },
		etag: { name: 'etag', data_type: { name: 'string' }, is_auto_generated: true },
		name: { name: 'name', data_type: { name: 'string' } },
		kind: { name: 'kind', data_type: { name: 'string' } },
	},
} as unknown as dyn.ModelSchema;
