import { MantineProvider } from '@mantine/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { MOVE_FIELD_EDITORS } from './moveAttributes';
import { ATTRIBUTE_ROW_EDITORS, MoveAttributeScopeContext, pickAttribute, withoutUsedAttributes } from './moveEditors';
import { MoveOptionsContext } from './moveOptions';

import type { MoveOptionLoaders } from './moveOptions';
import type { FormProviderRenderProps } from '@nikkierp/ui/components/form';


vi.mock('@nikkierp/ui/i18n', async importOriginal => ({
	...await importOriginal<object>(),
	useTranslate: () => (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
	useI18n: () => ({ language: 'en-US' }),
}));

const loaders: MoveOptionLoaders = { attributesOf: async () => [], valuesOf: async () => [] };

const EDITORS = { ...ATTRIBUTE_ROW_EDITORS, ...MOVE_FIELD_EDITORS };

function Harness({ field, values }: { field: string, values: Record<string, unknown> }): React.ReactNode {
	const form = useForm({ defaultValues: values });
	const Editor = EDITORS[field];
	return <Editor field={field} form={{ form } as unknown as FormProviderRenderProps} />;
}

function markup(field: string, values: Record<string, unknown>, templateId?: string): string {
	return renderToStaticMarkup(
		<MantineProvider>
			<MoveOptionsContext.Provider value={loaders}>
				<MoveAttributeScopeContext.Provider value={{ templateId, attributeByRow: new Map() }}>
					<Harness field={field} values={values} />
				</MoveAttributeScopeContext.Provider>
			</MoveOptionsContext.Provider>
		</MantineProvider>,
	).replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
}

const isButtonDisabled = (html: string) => /<button[^>]*disabled=""[^>]*configureAttributes|<button[^>]*configureAttributes[^>]*disabled=""/.test(html);

const isDisabled = (html: string) => /<input[^>]*data-testid="[^"]*"[^>]*disabled=""|<input[^>]*disabled=""/.test(html);

describe('the chained move pickers', () => {
	it('keeps Attribute disabled until the move has a template, and says so', () => {
		const html = markup('product_attribute_id', {});

		expect(isDisabled(html)).toBe(true);
		expect(html).toContain('stock_transfer_moves_pick_template');
	});

	it('keeps Value disabled until an attribute of the template is picked', () => {
		expect(isDisabled(markup('product_attribute_value_id', {}, 'T1'))).toBe(true);
	});

	it('hides the attributes the move already uses, keeping the row\'s own pick', () => {
		const options = ['COLOR', 'SIZE', 'FIT'].map(value => ({ value, label: value, templateAttributeId: `TA-${value}` }));

		expect(withoutUsedAttributes(options, ['COLOR', 'SIZE'], undefined).map(option => option.value)).toEqual(['FIT']);
		expect(withoutUsedAttributes(options, ['COLOR', 'SIZE'], 'SIZE').map(option => option.value))
			.toEqual(['SIZE', 'FIT']);
	});

	it('clears the value, dirty, when another attribute is picked', () => {
		const form = { setValue: vi.fn(), clearErrors: vi.fn() };

		pickAttribute(form, 'product_attribute_id', 'SIZE');

		expect(form.setValue.mock.calls).toEqual([
			['product_attribute_id', 'SIZE', { shouldDirty: true }],
			['product_attribute_value_id', null, { shouldDirty: true }],
		]);
		expect(form.clearErrors).toHaveBeenCalledWith(['product_attribute_id', 'product_attribute_value_id']);
	});
});

describe('the attributes cell', () => {
	it('shows the saved values as badges, then Configure', () => {
		const html = markup('attributes', {
			product_template_id: 'T1',
			attributes: [{ product_attribute_id: 'COLOR', product_attribute_value_id: 'RED', product_attribute_value: { name: 'Red' } }],
		});

		expect(html).toContain('Red');
		expect(html).toContain('Configure');
		expect(isButtonDisabled(html)).toBe(false);
	});

	it('keeps Configure disabled until the move has a template', () => {
		expect(isButtonDisabled(markup('attributes', { product_template_id: null, attributes: [] }))).toBe(true);
	});
});
