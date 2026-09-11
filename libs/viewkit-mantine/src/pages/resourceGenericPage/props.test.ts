import { describe, expect, it } from 'vitest';

import { resourceGenericPagePropsSchema } from './props';


describe('resourceGenericPagePropsSchema', () => {
	it('needs only the resource it belongs to, and defaults the namespace', () => {
		const props = resourceGenericPagePropsSchema.parse({ schemaName: 'inventory_product_template' });

		expect(props.translationNs).toBe('common');
		expect(props.backLinkTitle).toBeUndefined();
	});

	it('accepts an already-localized title, for a label that lives in the model schema', () => {
		const props = resourceGenericPagePropsSchema.parse({
			schemaName: 'inventory_product_template',
			titleLvl1: { textKey: 'import.title' },
			titleLvl2: { text: 'Products' },
		});

		expect(props.titleLvl2).toEqual({ text: 'Products' });
	});

	it('rejects a title spec mixing a key with literal text', () => {
		expect(() => resourceGenericPagePropsSchema.parse({
			schemaName: 'x', titleLvl1: { textKey: 'a', text: 'b' },
		})).toThrow();
	});

	it('rejects an unknown key, so a misspelled prop fails where the page is authored', () => {
		expect(() => resourceGenericPagePropsSchema.parse({
			schemaName: 'x', backLink: '../',
		})).toThrow();
	});
});
