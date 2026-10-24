import { localizeLangJson, resolveEdgeLabel } from '@nikkierp/ui/components/ExcelDataTable';
import i18next from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';

import { emptyDrafts, grantKey } from './permissionDrafts';
import {
	ACTION_FIELD, allActionsFirst, DRAFT_ROW_FLAG, isDraftRow, isEditedRow, mergeDraftRows, RESOURCE_FIELD, rowRefOf,
	toDraftGrant, toDraftRow,
} from './permissionTable';

import type { DraftGrant } from './permissionDrafts';
import type * as dyn from '@nikkierp/common/dynamicModel';


const ROLE = 'role-1';

const readGrant: DraftGrant = {
	resourceId: 'res-product', actionId: 'act-read', description: '  Look only  ',
	resourceName: { 'en-US': 'Inventory Product' }, actionName: { 'en-US': 'Read' },
};

const allGrant: DraftGrant = {
	resourceId: 'res-user', actionId: null, description: '', resourceName: 'IAM User', actionName: null,
};

const saved = [
	{ id: 'ent-1', resource_id: 'res-user', action_id: null, description: 'All' },
	{ id: 'ent-2', resource_id: 'res-product', action_id: 'act-write', description: null },
];

describe('toDraftRow', () => {
	it('keys the row on its grant and carries edge labels under the record label field', () => {
		const row = toDraftRow(readGrant);
		expect(row).toEqual({
			id: `draft:${grantKey('res-product', 'act-read')}`,
			etag: 'draft',
			[DRAFT_ROW_FLAG]: true,
			resource_id: 'res-product',
			action_id: 'act-read',
			description: 'Look only',
			resource: { id: 'res-product', name: { 'en-US': 'Inventory Product' } },
			action: { id: 'act-read', name: { 'en-US': 'Read' } },
		});
		expect(isDraftRow(row)).toBe(true);
	});

	it('has no action edge for an all-actions grant', () => {
		expect(toDraftRow(allGrant).action).toBeNull();
	});
});

describe('mergeDraftRows', () => {
	it('hides rows marked for removal and appends drafts', () => {
		const drafts = { ...emptyDrafts(ROLE), added: [readGrant], removed: ['ent-1'] };
		const rows = mergeDraftRows(saved, drafts);
		expect(rows.map(row => row.id)).toEqual(['ent-2', toDraftRow(readGrant).id]);
	});

	it('returns the loaded items unchanged without drafts', () => {
		expect(mergeDraftRows(saved, emptyDrafts(ROLE))).toEqual(saved);
	});

	it('shows the edited description of a saved row', () => {
		const drafts = { ...emptyDrafts(ROLE), updated: { 'ent-2': 'Write products' } };
		expect(mergeDraftRows(saved, drafts)[1]).toMatchObject({ id: 'ent-2', description: 'Write products' });
	});

	it('keeps drafts after the saved rows, in the order they were added', () => {
		const drafts = { ...emptyDrafts(ROLE), added: [readGrant, allGrant] };
		const ids = mergeDraftRows(saved, drafts).map(row => row.id);
		expect(ids).toEqual(['ent-1', 'ent-2', toDraftRow(readGrant).id, toDraftRow(allGrant).id]);
	});
});

describe('isEditedRow', () => {
	it('marks a saved row with a drafted description, which survives a table remount', () => {
		const drafts = { ...emptyDrafts(ROLE), updated: { 'ent-2': 'Write products' } };
		expect(saved.map(row => isEditedRow(row, drafts))).toEqual([false, true]);
	});

	it('leaves a draft grant to the "New" badge', () => {
		const row = toDraftRow(readGrant);
		const drafts = { ...emptyDrafts(ROLE), added: [readGrant], updated: { [String(row.id)]: 'x' } };
		expect(isEditedRow(row, drafts)).toBe(false);
	});
});

describe('allActionsFirst', () => {
	it('moves the All grant to the front of its resource and keeps the server order otherwise', () => {
		const rows = [
			{ id: 'a-read', resource_id: 'res-a', action_id: 'read' },
			{ id: 'a-all', resource_id: 'res-a', action_id: null },
			{ id: 'b-read', resource_id: 'res-b', action_id: 'read' },
			{ id: 'b-write', resource_id: 'res-b', action_id: 'write' },
			{ id: 'b-all', resource_id: 'res-b', action_id: null },
		];
		expect(allActionsFirst(rows).map(row => row.id)).toEqual(['a-all', 'a-read', 'b-all', 'b-read', 'b-write']);
	});
});

describe('rowRefOf', () => {
	it('names a draft by its grant key', () => {
		expect(rowRefOf(toDraftRow(allGrant))).toEqual({ key: grantKey('res-user', null), state: 'draft' });
	});

	it('names a draft from the row editor payload, which carries only its id', () => {
		expect(rowRefOf({ id: toDraftRow(readGrant).id, description: 'x' })).toEqual({
			key: grantKey('res-product', 'act-read'), state: 'draft',
		});
	});

	it('names a saved row by its id', () => {
		expect(rowRefOf(saved[0]!)).toEqual({ key: 'ent-1', state: 'existing' });
		expect(isDraftRow(saved[0])).toBe(false);
	});
});

describe('toDraftGrant', () => {
	const names = new Map<string, dyn.ModelSchemaLangJson>([['res-user', { 'en-US': 'IAM User' }]]);
	const nameOf = (id: string) => names.get(id);

	it('refuses a missing resource', () => {
		expect(toDraftGrant({ action_id: null }, nameOf).problem).toEqual({
			field: RESOURCE_FIELD, key: 'action.errors_resource_required',
		});
	});

	it('refuses an action left unpicked, but accepts null as all actions', () => {
		expect(toDraftGrant({ resource_id: 'res-user' }, nameOf).problem?.field).toBe(ACTION_FIELD);
		expect(toDraftGrant({ resource_id: 'res-user', action_id: null, description: 'x' }, nameOf)).toEqual({
			grant: {
				resourceId: 'res-user', actionId: null, resourceName: { 'en-US': 'IAM User' }, actionName: null,
				description: 'x',
			},
		});
	});
});

/*
 * `iam.json` holds both a bare `action` key (the `$ref` label of `action_id`) and flat dotted keys
 * starting with it (`action.fields_description`). Both must keep resolving.
 */
describe('permission column labels', () => {
	const entitlementSchema = {
		name: 'iam_entitlement',
		fields: {
			resource_id: { name: 'resource_id', label: { $ref: 'resource' } },
			action_id: { name: 'action_id', label: { $ref: 'action' } },
		},
		to_relations: [{ edge: 'resource', src_field: 'resource_id', dest_schema_name: 'iam_resource' }],
	} as unknown as dyn.ModelSchema;
	const related = { iam_resource: { name: 'iam_resource', record_label_field: 'name' } as dyn.ModelSchema };
	const translateRef = (key: string) => (i18next.exists(key, { ns: 'iam' }) ? i18next.t(key, { ns: 'iam' }) : undefined);

	beforeAll(async () => {
		await i18next.init({
			lng: 'en-US',
			resources: {
				'en-US': {
					iam: {
						'action': 'Action',
						'action.fields_description': 'Description',
						'resource': 'Resource',
					},
				},
			},
		});
	});

	it('resolves the $ref header labels of resource_id and action_id', () => {
		// What the table's default `translateFieldName` does with a field's schema label.
		const header = (field: string) => localizeLangJson(entitlementSchema.fields[field]!.label!, 'en-US', translateRef);
		expect(header(RESOURCE_FIELD)).toBe('Resource');
		expect(header(ACTION_FIELD)).toBe('Action');
		expect(i18next.t('action.fields_description', { ns: 'iam' })).toBe('Description');
	});

	it('resolves a draft row edge label like a saved one', () => {
		const label = resolveEdgeLabel(toDraftRow(readGrant), RESOURCE_FIELD, entitlementSchema, related, 'en-US');
		expect(label).toBe('Inventory Product');
	});
});
