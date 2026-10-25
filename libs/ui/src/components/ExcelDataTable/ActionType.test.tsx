// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ExcelDataTable } from './index';
import { makeData, polyfillDom, sampleItems } from './tableTestHarness';
import { testSchema } from './tableTestSchema';


vi.mock('../../i18n', async importOriginal => {
	const translate = (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key;
	return {
		...await importOriginal<object>(),
		useTranslate: () => translate,
		useI18n: () => ({ language: 'en' }),
		useSchemaLocalize: () => (value: unknown) => String(value ?? ''),
	};
});

vi.mock('../../microApp/MicroAppProvider', async importOriginal => ({
	...await importOriginal<object>(),
	useCommandBus: () => ({ publish: vi.fn(async () => ({ result: {} })) }),
}));

// jsdom lays nothing out, and a zero-wide toolbar folds every action into the compact menu.
const wideToolbar = vi.spyOn(Element.prototype, 'getBoundingClientRect')
	.mockReturnValue({ width: 1200, height: 40, top: 0, left: 0, right: 1200, bottom: 40, x: 0, y: 0 } as DOMRect);

beforeAll(polyfillDom);
afterEach(cleanup);
afterAll(() => wideToolbar.mockRestore());

function renderToolbar(actions: React.ReactNode) {
	return render(
		<MantineProvider env='test'>
			<MemoryRouter>
				<ExcelDataTable.Provider testId='t.table' modelSchema={testSchema} data={makeData(sampleItems)}>
					<ExcelDataTable.Toolbar left={<ExcelDataTable.Actions>{actions}</ExcelDataTable.Actions>} />
				</ExcelDataTable.Provider>
			</MemoryRouter>
		</MantineProvider>,
	);
}

const control = (testId: string) => screen.getByTestId(`t.table.action.${testId}`);

describe('ExcelDataTable toolbar action types', () => {
	it('renders a button, a link button and a text link', () => {
		renderToolbar(
			<>
				<ExcelDataTable.Action label='Run' testId='run' onClick={() => undefined} />
				<ExcelDataTable.Action label='Create' testId='create' href='new' />
				<ExcelDataTable.Action label='View all' testId='view' href='variants' type='link' />
			</>,
		);
		expect(control('run').tagName).toBe('BUTTON');
		expect(control('create').tagName).toBe('A');
		expect(control('create').className).toMatch(/Button/);
		expect(control('view').tagName).toBe('A');
		expect(control('view').className).toMatch(/Anchor/);
		expect(control('view').getAttribute('href')).toBe('/variants');
	});

	it('locks a link without hiding it', () => {
		renderToolbar(<ExcelDataTable.Action label='View all' testId='view' href='variants' type='link' locked />);
		expect(control('view').tagName).toBe('BUTTON');
		expect(control('view').getAttribute('data-locked')).toBe('true');
	});

	it('falls back to a button for a link type with no href', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		renderToolbar(<ExcelDataTable.Action label='Broken' testId='broken' type='link' />);
		expect(control('broken').tagName).toBe('BUTTON');
		warn.mockRestore();
	});
});
