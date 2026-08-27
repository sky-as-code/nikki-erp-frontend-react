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
	it('defaults showTitle to false', () => {
		const block = ownPropertySectionSchema.parse({ header: 'form.general', fields: ['name'] });

		expect(block.showTitle).toBe(false);
	});

	it('accepts an explicit showTitle', () => {
		const block = ownPropertySectionSchema.parse({
			header: 'form.general', fields: ['name'], showTitle: true,
		});

		expect(block.showTitle).toBe(true);
	});
});
