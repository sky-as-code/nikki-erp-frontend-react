import { MantineProvider } from '@mantine/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FieldLabelProvider } from './fieldLabelContext';
import { BaseFieldWrapper } from './fields';


function renderWrapper(labelHidden: boolean | undefined, error?: string): string {
	const field = (
		<BaseFieldWrapper inputId='qty' label='Quantity' description='How many' isRequired error={error}>
			<input id='qty' />
		</BaseFieldWrapper>
	);
	const tree = labelHidden === undefined
		? field
		: <FieldLabelProvider labelHidden={labelHidden}>{field}</FieldLabelProvider>;
	return renderToStaticMarkup(<MantineProvider>{tree}</MantineProvider>);
}

describe('BaseFieldWrapper label visibility', () => {
	it('renders the label row and description by default', () => {
		const html = renderWrapper(undefined);
		expect(html).toContain('id="qty-label"');
		expect(html).toContain('How many');
		expect(html).toContain('mantine-Grid-root');
	});

	it('keeps a hidden label for assistive technology, with the required star, and drops the description', () => {
		const html = renderWrapper(true);
		expect(html).toMatch(/mantine-VisuallyHidden-root[^>]*>.*id="qty-label".*Quantity.*\*/);
		expect(html).toContain('aria-labelledby="qty-label"');
		expect(html).not.toContain('How many');
		expect(html).not.toContain('mantine-Grid-root');
	});

	it('still shows the validation error below the input when the label is hidden', () => {
		const html = renderWrapper(true, 'Too many');
		expect(html).toContain('Too many');
		expect(html).toContain('aria-invalid="true"');
		expect(html.indexOf('id="qty"')).toBeLessThan(html.indexOf('Too many'));
	});
});
