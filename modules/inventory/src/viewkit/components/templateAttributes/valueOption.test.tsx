import { MantineProvider } from '@mantine/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BROWSE_ALL, renderValueOption } from './valueOption';


function html(value: string, checked: boolean): string {
	const node = renderValueOption({ option: { value, label: `label-${value}` }, checked });
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
}

/** SFB-003: a value already picked (a pill) is marked in the dropdown. */
describe('the values select option', () => {
	it('marks a picked value with a check', () => {
		const markup = html('red', true);

		expect(markup).toContain('inventory.templateAttributes.valuesOptionCheck');
		expect(markup).toContain('data-checked="true"');
		expect(markup).toContain('label-red');
	});

	it('shows an unpicked value without one', () => {
		const markup = html('blue', false);

		expect(markup).not.toContain('valuesOptionCheck');
		expect(markup).not.toContain('data-checked');
		expect(markup).toContain('label-blue');
	});

	it('keeps "Browse all…" a plain action, never checked', () => {
		const markup = html(BROWSE_ALL, true);

		expect(markup).toContain('inventory.templateAttributes.valuesBrowseAll');
		expect(markup).not.toContain('valuesOptionCheck');
	});
});
