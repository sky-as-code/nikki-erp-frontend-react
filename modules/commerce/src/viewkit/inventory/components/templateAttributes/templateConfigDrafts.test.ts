import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import { combinationLabel, firstRows, holdsQuantity, needsConfirmation, previewVariantLabel } from './configPreview';
import {
	addExclusion, addLine, buildConfigContribution, configFromRecord, emptyConfig, isConfigChanged, isEtagMismatch,
	mapConfigErrors, removeExclusion, removeLine, setLineAttribute, setLineSequence, setLineValues, toConfigPayload,
} from './templateConfigDrafts';

import type { ConfigPreview } from './configPreview';


const SAVED = {
	attribute_lines: [
		{ id: 'l2', attribute_id: 'size', value_ids: ['s', 'm'], sequence: 2, variant_creation_snapshot: 'instant' },
		{ id: 'l1', attribute_id: 'color', value_ids: ['red', 'blue'], sequence: 1, variant_creation_snapshot: 'instant' },
	],
	exclusions: [{ left_value_id: 'red', right_value_id: 's' }],
};

function errorAt(field: string, key = 'inventory:product_template.line_without_values'): ClientErrorItem {
	return new ClientErrorItem({ field, key, message: 'x', type: 'validation' });
}

describe('template configuration drafts', () => {
	it('reads the saved configuration ordered by sequence, and tolerates none', () => {
		const draft = configFromRecord(SAVED);

		expect(draft.lines.map(line => [line.attributeId, line.snapshot, line.id])).toEqual([
			['color', 'instant', 'l1'], ['size', 'instant', 'l2'],
		]);
		expect(draft.exclusions).toHaveLength(1);
		expect(configFromRecord(undefined)).toEqual(emptyConfig());
	});

	it('sends nothing while the draft equals what is saved, whatever the row or value order', () => {
		const saved = configFromRecord(SAVED);
		const [color] = saved.lines;
		const reordered = setLineValues(saved, color.key, ['blue', 'red']);

		expect(isConfigChanged(saved, reordered)).toBe(false);
		expect(buildConfigContribution(saved, reordered)).toBeUndefined();
	});

	it('sends the FULL desired state with the sent row keys, skipping a blank row', () => {
		const saved = configFromRecord(SAVED);
		let draft = addLine(saved);
		draft = addLine(draft);
		const fit = draft.lines[2];
		draft = setLineAttribute(draft, fit.key, 'fit');
		draft = setLineValues(draft, fit.key, ['slim']);
		const contribution = buildConfigContribution(saved, draft);

		expect(contribution?.payload).toEqual({
			attribute_lines: [
				{ attribute_id: 'color', value_ids: ['red', 'blue'], sequence: 1 },
				{ attribute_id: 'size', value_ids: ['s', 'm'], sequence: 2 },
				{ attribute_id: 'fit', value_ids: ['slim'], sequence: 3 },
			],
			exclusions: [{ left_value_id: 'red', right_value_id: 's' }],
		});
		expect(contribution?.sent.lines).toEqual([draft.lines[0].key, draft.lines[1].key, fit.key]);
	});

});

describe('template configuration exclusions', () => {
	it('drops an exclusion with the value or line it names', () => {
		const saved = configFromRecord(SAVED);
		const [color, size] = saved.lines;

		expect(setLineValues(saved, color.key, ['blue']).exclusions).toEqual([]);
		expect(removeLine(saved, size.key).exclusions).toEqual([]);
		expect(setLineAttribute(saved, color.key, 'fabric').lines[0]).toMatchObject({ valueIds: [], snapshot: undefined });
	});

	it('adds a pair once in either order, never a value with itself, and removes it', () => {
		const saved = configFromRecord(SAVED);
		const same = addExclusion(saved, 's', 'red');
		const added = addExclusion(saved, 'blue', 'm');

		expect(same).toBe(saved);
		expect(addExclusion(saved, 'red', 'red')).toBe(saved);
		expect(added.exclusions.map(item => [item.leftValueId, item.rightValueId])).toEqual([['red', 's'], ['blue', 'm']]);
		expect(removeExclusion(added, added.exclusions[1].key).exclusions).toHaveLength(1);
	});

});

describe('template configuration edits and errors', () => {
	it('clears a sequence to omit it from the line', () => {
		const saved = configFromRecord(SAVED);

		expect(toConfigPayload(setLineSequence(saved, saved.lines[0].key, null)).attribute_lines[0])
			.toEqual({ attribute_id: 'color', value_ids: ['red', 'blue'] });
	});

	it('pins row errors on the sent rows and keeps the rest general', () => {
		const sent = { lines: ['line:a', 'line:b'], exclusions: ['exclusion:x'] };
		const errors = mapConfigErrors([
			errorAt('attribute_lines[1].value_ids'),
			errorAt('exclusions[0]'),
			errorAt('attribute_lines'),
			errorAt('attribute_lines[7].attribute_id'),
			errorAt('name'),
		], sent);

		expect(Object.keys(errors.lines)).toEqual(['line:b']);
		expect(Object.keys(errors.exclusions)).toEqual(['exclusion:x']);
		expect(errors.general.map(item => item.field)).toEqual(['attribute_lines', 'attribute_lines[7].attribute_id']);
	});

	it('recognizes a stale etag by its bare key', () => {
		expect(isEtagMismatch([errorAt('etag', 'common:err_etag_mismatched')])).toBe(true);
		expect(isEtagMismatch([errorAt('etag')])).toBe(false);
	});
});

function preview(overrides: Partial<ConfigPreview>): ConfigPreview {
	return {
		etag: 'e', pre_create_count: 0, possible_complete_count: 0, possible_over_threshold: false,
		inactive_exclusions: [], changes_identity: false, create: [], archive: [], delete: [],
		counts: { keep: 0, extend: 0, restore: 0, create: 0, archive: 0, delete: 0, untouched: 0 },
		...overrides,
	};
}

describe('configuration preview summary', () => {
	it('asks only for an identity change, an archive or a delete', () => {
		const counts = { keep: 1, extend: 0, restore: 0, create: 4, archive: 0, delete: 0, untouched: 0 };

		expect(needsConfirmation(preview({ counts }))).toBe(false);
		expect(needsConfirmation(preview({ changes_identity: true }))).toBe(true);
		expect(needsConfirmation(preview({ counts: { ...counts, archive: 1 } }))).toBe(true);
		expect(needsConfirmation(preview({ delete: [{ variant_kind: 'complete', combination_key: 'k', value_ids: [] }] })))
			.toBe(true);
	});

	it('labels a combination by its values, and the empty one as the default variant', () => {
		const labels: Record<string, string> = { red: 'Red', m: 'M' };

		expect(combinationLabel(['red', 'm'], id => labels[id], 'Default')).toBe('Red / M');
		expect(combinationLabel([], id => id, 'Default')).toBe('Default');
	});

	it('labels a preview item by its display_name, a langjson one in the current language', () => {
		const item = { variant_kind: 'complete', combination_key: 'k', value_ids: ['red'] };
		const fallback = () => 'Red';

		expect(previewVariantLabel({ ...item, display_name: 'Tee / Red' }, 'en-US', fallback)).toBe('Tee / Red');
		expect(previewVariantLabel(
			{ ...item, display_name: { 'en-US': 'Tee / Red', 'vi-VN': 'Áo / Đỏ' } }, 'vi-VN', fallback,
		)).toBe('Áo / Đỏ');
		expect(previewVariantLabel({ ...item, display_name: { 'en-US': 'Tee / Red' } }, 'vi-VN', fallback)).toBe('Tee / Red');
	});

	it('falls back to the client-side combination when display_name is absent or empty', () => {
		const item = { variant_kind: 'complete', combination_key: 'k', value_ids: ['red'] };

		expect(previewVariantLabel(item, 'en-US', () => 'Red')).toBe('Red');
		expect(previewVariantLabel({ ...item, display_name: '' }, 'en-US', () => 'Red')).toBe('Red');
		expect(previewVariantLabel({ ...item, display_name: {} }, 'en-US', () => 'Red')).toBe('Red');
	});

	it('flags only a held quantity and caps a list', () => {
		expect(holdsQuantity('0.000')).toBe(false);
		expect(holdsQuantity(undefined)).toBe(false);
		expect(holdsQuantity('2.5')).toBe(true);
		expect(firstRows([1, 2, 3], 2)).toEqual({ shown: [1, 2], hidden: 1 });
		expect(firstRows(null, 2)).toEqual({ shown: [], hidden: 0 });
	});
});
