// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { FilterBox } from './FilterBox';
import { polyfillDom } from '../../ExcelDataTable/tableTestHarness';
import { dataTableTestIds } from '../testIds';


vi.mock('../../../i18n', async importOriginal => ({
	...await importOriginal<object>(),
	useTranslate: () => (key: string) => key,
}));

beforeAll(polyfillDom);
afterEach(cleanup);

function renderFilterBox(enableHotKeys?: boolean) {
	render(
		<MantineProvider env='test'>
			<FilterBox
				activeCount={0}
				expanded={false}
				onToggle={() => undefined}
				enableHotKeys={enableHotKeys}
				tid={dataTableTestIds('t', 'table')}
			/>
		</MantineProvider>,
	);
	return screen.getByRole('button');
}

describe('DataTable FilterBox hot key', () => {
	it('announces Alt+/ by default', () => {
		expect(renderFilterBox().getAttribute('aria-keyshortcuts')).toBe('Alt+/');
	});

	it('registers nothing when enableHotKeys is off', () => {
		expect(renderFilterBox(false).hasAttribute('aria-keyshortcuts')).toBe(false);
	});
});
