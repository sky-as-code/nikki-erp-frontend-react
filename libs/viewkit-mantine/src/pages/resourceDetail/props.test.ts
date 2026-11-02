import { describe, expect, it } from 'vitest';

import { ownPropertySectionSchema, resourceDetailExtraActionSchema } from './props';


/**
 * A contextual action either publishes a command or navigates to a page. The union is enforced in
 * the schema rather than at render time because a page that authors both, or neither, is a
 * mistake with no sensible fallback — and page props are parsed eagerly, so it surfaces where the
 * page is written instead of as a dead button.
 */
describe('resourceDetailExtraActionSchema', () => {
	it('accepts a command action', () => {
		const action = resourceDetailExtraActionSchema.parse({
			label: 'action.confirm', command: 'inventory.stock_transfer.confirm',
		});

		expect(action.command).toBe('inventory.stock_transfer.confirm');
		expect(action.routePath).toBeUndefined();
	});

	it('accepts a link action naming a target page', () => {
		const action = resourceDetailExtraActionSchema.parse({
			label: 'kiosk.tabs.products_grid', routePath: 'kiosks/:id/stock-grid',
		});

		expect(action.routePath).toBe('kiosks/:id/stock-grid');
		expect(action.command).toBeUndefined();
	});

	it('rejects an action that both publishes and navigates', () => {
		expect(() => resourceDetailExtraActionSchema.parse({
			label: 'a.b', command: 'some.command', routePath: 'kiosks/:id',
		})).toThrow();
	});

	it('accepts a component action naming a registered renderer', () => {
		const action = resourceDetailExtraActionSchema.parse({
			label: 'a.b', component: 'nikkierp.inventory.components.templateResolveVariant.v1',
		});

		expect(action.component).toBe('nikkierp.inventory.components.templateResolveVariant.v1');
	});

	it('rejects a component action that also publishes', () => {
		expect(() => resourceDetailExtraActionSchema.parse({
			label: 'a.b', command: 'some.command', component: 'some.component.v1',
		})).toThrow();
	});

	it('rejects an action that does neither', () => {
		expect(() => resourceDetailExtraActionSchema.parse({ label: 'a.b' })).toThrow();
	});

	/** A prompt collects values to merge into a command's request, so a link has no use for one. */
	it('rejects a prompt on a link action', () => {
		expect(() => resourceDetailExtraActionSchema.parse({
			label: 'a.b',
			routePath: 'kiosks/:id',
			prompt: { title: 'a.title', fields: [{ name: 'quantity' }] },
		})).toThrow();
	});

	it('keeps a prompt on a command action', () => {
		const action = resourceDetailExtraActionSchema.parse({
			label: 'a.b',
			command: 'some.command',
			prompt: { title: 'a.title', fields: [{ name: 'quantity' }] },
		});

		expect(action.prompt?.fields).toHaveLength(1);
	});
});

describe('ownPropertySectionSchema', () => {
	it('accepts an explicit showTitle', () => {
		const block = ownPropertySectionSchema.parse({
			header: 'form.general', fields: ['name'], showTitle: true,
		});

		expect(block.showTitle).toBe(true);
	});

	it('is fluid unless told otherwise', () => {
		expect(ownPropertySectionSchema.parse({ fields: ['name'] }).isFluid).toBe(true);
		expect(ownPropertySectionSchema.parse({ fields: ['note'], isFluid: false }).isFluid).toBe(false);
	});

	it('rejects a bare array: an inline row is a field group display', () => {
		const fields = ['name', ['$$form.parent', '@@parent_id', 'of', '@@warehouse_id']];

		expect(() => ownPropertySectionSchema.parse({ fields })).toThrow();
	});

	it('accepts a field group display, label and isFullRow optional', () => {
		const price = { label: 'fields.list_price', fields: ['@@list_price', '$$common:per', '@@uom_id'] };
		const bare = { fields: ['@@weight', '@@weight_uom_symbol'], isFullRow: true };

		expect(ownPropertySectionSchema.parse({ fields: ['name', price, bare] }).fields).toEqual(['name', price, bare]);
		expect(() => ownPropertySectionSchema.parse({ fields: [{ label: 'fields.x' }] })).toThrow();
		expect(() => ownPropertySectionSchema.parse({ fields: [{ label: '', fields: ['@@x'] }] })).toThrow();
		expect(() => ownPropertySectionSchema.parse({ fields: [{ ...price, extra: true }] })).toThrow();
		expect(() => ownPropertySectionSchema.parse({ fields: [{ label: 'x', field: ['@@x'] }] })).toThrow();
	});

	it('keeps widths parallel to fields and on @@ items only', () => {
		const parse = (widths: unknown[]) => ownPropertySectionSchema.parse({
			fields: [{ fields: ['@@price', '$$common:per', '@@uom_id'], widths }],
		});

		expect(() => parse(['8rem', null, '120px'])).not.toThrow();
		expect(() => parse(['8rem', undefined])).not.toThrow();
		expect(() => parse(['8rem', null, null, '1rem'])).toThrow();
		expect(() => parse([null, '2rem'])).toThrow();
		expect(() => parse(['wide'])).toThrow();
	});

	it('rejects an inline row nested deeper than one level', () => {
		expect(() => ownPropertySectionSchema.parse({ fields: [['@@name', ['@@code']]] })).toThrow();
	});

	it('takes a locked field as the record flag that unlocks it plus a hint key', () => {
		const lockedFields = { mode: { unless: 'can_change_mode', hint: 'mode_locked_hint' } };

		expect(ownPropertySectionSchema.parse({ fields: ['mode'], lockedFields }).lockedFields).toEqual(lockedFields);
		expect(() => ownPropertySectionSchema.parse({ fields: ['mode'], lockedFields: { mode: { unless: 'x' } } }))
			.toThrow();
	});

	it('takes visibleWhen as one condition or a list that must all hold', () => {
		const visibleWhen = {
			receiving_location_id: { field: 'incoming_flow', operator: 'in', value: ['two_step', 'three_step'] },
			quality_location_id: [
				{ field: 'incoming_flow', operator: 'equal', value: 'three_step' },
				{ field: 'is_archived', operator: 'not_equal', value: true },
			],
		};

		expect(ownPropertySectionSchema.parse({ fields: ['name'], visibleWhen }).visibleWhen).toEqual(visibleWhen);
	});

	it('rejects a visibleWhen with an unknown operator or an empty list', () => {
		const badOperator = { code: { field: 'kind', operator: 'like', value: 'x' } };
		expect(() => ownPropertySectionSchema.parse({ fields: ['code'], visibleWhen: badOperator })).toThrow();
		expect(() => ownPropertySectionSchema.parse({ fields: ['code'], visibleWhen: { code: [] } })).toThrow();
	});
});
