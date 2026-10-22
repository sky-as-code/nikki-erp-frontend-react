import { MantineProvider } from '@mantine/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { PageHeader } from './PageHeader';
import { PageHeaderProvider } from './pageHeaderContext';
import { EnumFieldRenderer } from '../../fields/valueRenderers';
import { DetailFieldDisplayProvider } from '../../pages/resourceDetailV2/detailFieldDisplay';

import type { PageHeaderContextValue } from './pageHeaderContext';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


vi.mock('@nikkierp/ui/i18n', () => {
	const messages: Record<string, string> = { 'status.confirmed': 'Confirmed' };
	// Mirrors i18next with `appendNamespaceToMissingKey`: a missing key comes back as `ns:key`.
	const t = (key: string) => messages[key] ?? `sales:${key}`;
	const localize = (langJson: unknown) => t(typeof langJson === 'string' ? langJson : (langJson as { $ref: string }).$ref);
	return { useTranslate: () => t, useLocalize: () => localize };
});

const modelSchema = {
	name: 'sales_order',
	fields: { status: { name: 'status', data_type: { name: 'enumString' } } },
} as unknown as dyn.ModelSchema;

function renderTitle(status: string, fieldRenderers?: FieldRendererMap): string {
	const context: PageHeaderContextValue = { translationNs: 'sales', record: { status }, modelSchema };
	const header = React.createElement(PageHeader, { titleLvl2: { schemaField: 'status' } });
	const withContext = React.createElement(PageHeaderProvider, { value: context, children: header });
	const display = { fieldRenderers, stableFieldLayout: false };
	const withDisplay = React.createElement(DetailFieldDisplayProvider, { value: display, children: withContext });
	const tree = React.createElement(MantineProvider, null, React.createElement(MemoryRouter, null, withDisplay));
	return renderToStaticMarkup(tree);
}

describe('PageHeader schema-field title', () => {
	it('translates an enum value as `{field}.{value}`', () => {
		expect(renderTitle('confirmed')).toContain('>Confirmed<');
	});

	it('falls back to the raw value when the key is missing', () => {
		expect(renderTitle('draft')).toContain('>draft<');
	});

	it('styles the value with the renderer the detail page declares', () => {
		const html = renderTitle('confirmed', { status: new EnumFieldRenderer({ confirmed: 'green' }, 'status.') });
		expect(html).toContain('mantine-Badge-root');
		expect(html).toContain('Confirmed');
	});
});
