// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ExcelDataTable } from './index';
import { makeData, polyfillDom, sampleItems } from './tableTestHarness';
import { testSchema } from './tableTestSchema';
import { press, stubLayout } from '../../shortcuts/shortcutTestHarness';

import type { ExcelDataTableProviderProps } from './Provider';


vi.mock('../../i18n', async importOriginal => {
	const translate = (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key;
	return {
		...await importOriginal<object>(),
		useTranslate: () => translate,
		useI18n: () => ({ language: 'en' }),
		useSchemaLocalize: () => (value: unknown) => String(value ?? ''),
	};
});

let restoreLayout: () => void = () => undefined;
beforeAll(() => {
	polyfillDom();
	restoreLayout = stubLayout();
});
afterAll(() => restoreLayout());
afterEach(cleanup);

type PartsProps = Pick<ExcelDataTableProviderProps, 'enableHotKeys'> & { partHotKeys?: boolean };

function renderParts({ enableHotKeys, partHotKeys }: PartsProps = {}) {
	// Three pages, so neither step button is disabled at a bound.
	const data = { ...makeData(sampleItems), total: 150, size: 50 };
	return render(
		<MantineProvider env='test'>
			<MemoryRouter>
				<ExcelDataTable.Provider testId='t.table' modelSchema={testSchema} data={data} enableHotKeys={enableHotKeys}>
					<ExcelDataTable.FilterButton enableHotKeys={partHotKeys} />
					<ExcelDataTable.Pagination enableHotKeys={partHotKeys} />
				</ExcelDataTable.Provider>
			</MemoryRouter>
		</MantineProvider>,
	);
}

function announcedShortcuts(): string[] {
	return Array.from(document.querySelectorAll('[aria-keyshortcuts]'))
		.map(element => element.getAttribute('aria-keyshortcuts') ?? '')
		.sort();
}

const filterToggle = () => screen.getByRole('button', { expanded: false });

describe('ExcelDataTable enableHotKeys', () => {
	it('registers the filter and pagination keys by default', () => {
		renderParts();
		expect(announcedShortcuts()).toEqual(['Alt+/', 'Alt+ArrowLeft', 'Alt+ArrowRight', 'Alt+P']);
		expect(press('keydown', { key: '/', code: 'Slash' })).toBe(true);
	});

	it('registers none of them when the Provider turns hot keys off', () => {
		renderParts({ enableHotKeys: false });
		expect(announcedShortcuts()).toEqual([]);
		const toggle = filterToggle();
		expect(press('keydown', { key: '/', code: 'Slash' })).toBe(false);
		expect(press('keydown', { key: 'ArrowRight', code: 'ArrowRight' })).toBe(false);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
	});

	it('lets a part override the Provider either way', () => {
		renderParts({ partHotKeys: false });
		expect(announcedShortcuts()).toEqual([]);
		cleanup();
		renderParts({ enableHotKeys: false, partHotKeys: true });
		expect(announcedShortcuts()).toEqual(['Alt+/', 'Alt+ArrowLeft', 'Alt+ArrowRight', 'Alt+P']);
	});
});
