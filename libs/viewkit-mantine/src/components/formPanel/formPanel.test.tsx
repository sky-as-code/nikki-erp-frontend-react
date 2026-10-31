// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderInDetailPage } from '../../pages/resourceDetailV2/audit/auditTestHarness';
import { collapsibleSectionRenderer } from '../collapsibleSection/CollapsibleSection';
import { collapsibleSectionPropsSchema } from '../collapsibleSection/props';
import { SectionHeader } from '../collapsibleSection/SectionHeader';

import type { CollapsibleSectionPropsInput } from '../collapsibleSection/props';


vi.mock('@nikkierp/ui/i18n', async importOriginal => {
	const { testI18nMock } = await import('../../pages/resourceDetailV2/audit/auditTestI18n');
	return { ...await importOriginal<object>(), ...testI18nMock, useSchemaLocalize: () => () => '' };
});

afterEach(cleanup);

function renderPanel(input: Partial<CollapsibleSectionPropsInput> = {}) {
	const props = collapsibleSectionPropsSchema.parse({
		layout: 'formBlocks', header: 'form.movement', translationNs: 'inventory', ...input,
	});
	return renderInDetailPage(<>{collapsibleSectionRenderer.render(props, {} as never)}</>);
}

describe('form panel', () => {
	it('names the panel by its h2 title', () => {
		renderPanel();
		const title = screen.getByRole('heading', { level: 2 });
		expect(title.textContent).toBe('test:form.movement');
		expect(title.closest('[aria-labelledby]')?.getAttribute('aria-labelledby')).toBe(title.id);
	});

	it('makes the whole title the toggle, named by the title', () => {
		renderPanel();
		const toggle = screen.getByRole('button', { name: 'test:form.movement' });
		expect(toggle.closest('h2')).not.toBeNull();
		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		fireEvent.click(toggle);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
	});

	it('labels an untitled toggle by what it does', () => {
		renderPanel({ header: undefined, translationNs: undefined });
		const toggle = screen.getByRole('button', { name: 'Collapse section' });
		fireEvent.click(toggle);
		expect(toggle.getAttribute('aria-label')).toBe('Expand section');
	});

	it('keeps the right segment outside the toggle', () => {
		renderInDetailPage(
			<SectionHeader
				title='Title' collapsible expanded onToggle={() => {}}
				rightSegment={<span data-testid='right'>{'strip'}</span>}
			/>,
		);
		const toggle = screen.getByRole('button', { name: 'Title' });
		expect(toggle.contains(screen.getByTestId('right'))).toBe(false);
	});

	it('gives a stack section the same header', () => {
		renderPanel({ layout: 'stack' });
		const toggle = screen.getByRole('button', { name: 'test:form.movement' });
		expect(toggle.closest('h2')).not.toBeNull();
	});

	it('renders no collapse button when not collapsible', () => {
		renderPanel({ collapsible: false });
		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByRole('heading', { level: 2 })).not.toBeNull();
	});
});
