import { describe, expect, it } from 'vitest';

import { defaultListFields, ownFieldNames, toOneEdges, withEdgeLabelFields } from './edge_label_fields';

import type { ViewSchema } from './edge_label_fields';


const userSchema: ViewSchema = {
	fields: {
		id: { name: 'id' },
		display_name: { name: 'display_name' },
		org_unit_id: { name: 'org_unit_id' },
		hierarchy_id: { name: 'hierarchy_id' },
		org_unit: { name: 'org_unit', is_edge_model: true },
	},
	default_search_fields: ['display_name', 'org_unit_id'],
	to_relations: [
		{ edge: 'org_unit', src_field: 'org_unit_id', dest_schema_name: 'iam_orgunit', relation_type: 'many:one' },
		{ edge: 'hierarchy', src_field: 'hierarchy_id', dest_schema_name: 'iam_hierarchy', relation_type: 'one:one' },
		{ edge: 'groups', dest_schema_name: 'iam_group', relation_type: 'many:many' },
		{ edge: 'children', src_field: 'parent_id', dest_schema_name: 'iam_user', relation_type: 'one:many' },
	],
};

const destSchemas: Record<string, ViewSchema> = {
	iam_orgunit: { record_label_field: 'name' },
	iam_hierarchy: {},
	iam_group: { record_label_field: 'name' },
};

describe('toOneEdges', () => {
	it('keeps many:one and one:one edges with a source field', () => {
		expect(toOneEdges(userSchema).map((edge) => edge.edge)).toEqual(['org_unit', 'hierarchy']);
		expect(toOneEdges(undefined)).toEqual([]);
		expect(toOneEdges({ to_relations: [{ edge: 3 }] })).toEqual([]);
	});
});

describe('ownFieldNames / defaultListFields', () => {
	it('expands * to the non-edge fields and falls back to * without default_search_fields', () => {
		expect(ownFieldNames(userSchema)).toEqual(['id', 'display_name', 'org_unit_id', 'hierarchy_id']);
		expect(defaultListFields(userSchema)).toEqual(['display_name', 'org_unit_id']);
		expect(defaultListFields({})).toEqual(['*']);
	});
});

describe('withEdgeLabelFields', () => {
	it('adds the label of each selected foreign key whose destination has a record_label_field', () => {
		expect(withEdgeLabelFields(['*'], userSchema, destSchemas)).toEqual({
			fields: ['*', 'org_unit.name'], added: ['org_unit.name'], edgeLabels: { org_unit: 'name' },
		});
	});

	it('adds nothing for an edge whose foreign key is not selected', () => {
		expect(withEdgeLabelFields(['display_name'], userSchema, destSchemas)).toEqual({
			fields: ['display_name'], added: [], edgeLabels: {},
		});
	});

	it('names a label the caller already selected without adding it again', () => {
		expect(withEdgeLabelFields(['org_unit_id', 'org_unit.name'], userSchema, destSchemas)).toEqual({
			fields: ['org_unit_id', 'org_unit.name'], added: [], edgeLabels: { org_unit: 'name' },
		});
	});

	it('skips an edge whose destination schema is missing', () => {
		expect(withEdgeLabelFields(['*'], userSchema, {}).added).toEqual([]);
	});
});
