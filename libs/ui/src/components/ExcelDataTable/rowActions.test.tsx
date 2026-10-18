import { MantineProvider } from '@mantine/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { DeleteRowAction } from './rowActions';


vi.mock('../../i18n', () => ({
	useTranslate: () => (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? `t(${key})`,
}));

function renderDelete(label?: string): string {
	return renderToStaticMarkup(
		<MantineProvider>
			<DeleteRowAction onDelete={() => undefined} label={label} />
		</MantineProvider>,
	);
}

describe('DeleteRowAction label', () => {
	it('reads "Delete" by default', () => {
		expect(renderDelete()).toContain('Delete');
	});

	it('translates the given label key instead', () => {
		const html = renderDelete('common:action.unassign');
		expect(html).toContain('t(common:action.unassign)');
		expect(html).not.toContain('Delete');
	});
});
