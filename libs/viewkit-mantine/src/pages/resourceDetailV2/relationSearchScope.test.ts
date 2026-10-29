import { describe, expect, it } from 'vitest';

import { buildRelationSearchScopes, relationSearchSourceFields } from './relationSearchScope';


describe('relation search scopes', () => {
	const spec = {
		operation_type_id: { matchFormFields: { operation_code: 'operation_code' } },
		product_variant_id: { searchField: 'product_template_name' },
	};

	it('watches each form field a select is matched on, once', () => {
		expect(relationSearchSourceFields(spec)).toEqual(['operation_code']);
		expect(relationSearchSourceFields(undefined)).toEqual([]);
	});

	it('narrows a select to the records matching the form value', () => {
		expect(buildRelationSearchScopes(spec, { operation_code: 'incoming' })).toEqual({
			operation_type_id: { searchField: undefined, graph: { if: ['operation_code', '=', 'incoming'] } },
			product_variant_id: { searchField: 'product_template_name', graph: undefined },
		});
	});

	it('narrows nothing while the source field is empty', () => {
		const scopes = buildRelationSearchScopes(spec, { operation_code: '' });

		expect(scopes.operation_type_id.graph).toBeUndefined();
	});

	it('ANDs several matched fields', () => {
		const scopes = buildRelationSearchScopes(
			{ location_id: { matchFormFields: { warehouse_id: 'warehouse_id', location_type: 'kind' } } },
			{ warehouse_id: 'W1', kind: 'internal' },
		);

		expect(scopes.location_id.graph).toEqual({
			and: [{ if: ['warehouse_id', '=', 'W1'] }, { if: ['location_type', '=', 'internal'] }],
		});
	});
});
