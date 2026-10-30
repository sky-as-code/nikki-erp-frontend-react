import { describe, expect, it } from 'vitest';

import { fetchedRecordOf, relationSelectionMode } from './RelationSelectField';

import type * as dyn from '@nikkierp/common/dynamicModel';


function relation(relationType: dyn.ModelSchemaRelation['relation_type']): dyn.ModelSchemaRelation {
	return { relation_type: relationType, dest_schema_name: 'essential_uom' } as dyn.ModelSchemaRelation;
}

describe('relationSelectionMode', () => {
	it('picks one record for a relation that owns the foreign key', () => {
		expect(relationSelectionMode(relation('many:one'))).toBe('single');
		expect(relationSelectionMode(relation('one:one'))).toBe('single');
	});

	it('picks several records for a to-many relation', () => {
		expect(relationSelectionMode(relation('one:many'))).toBe('multiple');
		expect(relationSelectionMode(relation('many:many'))).toBe('multiple');
	});

	it('defaults to one record while the relation is unresolved', () => {
		expect(relationSelectionMode(undefined)).toBe('single');
	});
});

describe('fetchedRecordOf', () => {
	it('unwraps the record a get-by-id answered, so an off-page selection is labelled by it', () => {
		const item = { id: 'T1', name: 'Robot Mixed Template' };

		expect(fetchedRecordOf({ item, meta: {} } as never)).toBe(item);
		expect(fetchedRecordOf(null)).toBeUndefined();
	});
});
