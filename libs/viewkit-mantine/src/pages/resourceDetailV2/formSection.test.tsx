// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderInDetailPage } from './audit/auditTestHarness';
import { FieldPair, FieldRuns, FormSection } from './formSection';
import panelClasses from '../../components/formPanel/FormPanel.module.css';


vi.mock('@nikkierp/ui/i18n', async importOriginal => {
	const { testI18nMock } = await import('./audit/auditTestI18n');
	return { ...await importOriginal<object>(), ...testI18nMock };
});

afterEach(cleanup);

const renderPair = (field: string, labelHidden: boolean): React.ReactNode => (
	<FieldPair asTerm={!labelHidden} label={labelHidden ? null : `label ${field}`}>{`value ${field}`}</FieldPair>
);

describe('form section fields', () => {
	it('renders read-mode fields as dt/dd pairs, an inline row splitting the runs', () => {
		const { container } = renderInDetailPage(<FieldRuns
			fields={['transfer_number', ['priority'], 'origin_reference']} semantic renderField={renderPair}
		/>);
		const lists = container.querySelectorAll('dl');
		expect(lists).toHaveLength(2);
		expect(lists[0].querySelector('dt')?.textContent).toBe('label transfer_number');
		expect(lists[0].querySelector('dd')?.textContent).toBe('value transfer_number');
		expect(screen.getByTestId('resourceForm.inlineRow').closest('dl')).toBeNull();
	});

	it('keeps every field in its column, long text included', () => {
		const { container } = renderInDetailPage(
			<FieldRuns fields={['transfer_number', 'note']} semantic renderField={renderPair} />,
		);
		expect(container.querySelector('dl')?.textContent).toContain('value note');
	});
});

describe('form section layout', () => {
	const sectionOf = (block: { isFluid?: boolean, showSeparator?: boolean }) => renderInDetailPage(
		<FormSection block={block} title={undefined}>{'fields'}</FormSection>,
	).container.querySelector('section');

	it('shares the row and draws its separator by default', () => {
		const section = sectionOf({ isFluid: true, showSeparator: true });
		expect(section?.classList.contains(panelClasses.section)).toBe(true);
		expect(section?.classList.contains(panelClasses.fullRow)).toBe(false);
		expect(section?.classList.contains(panelClasses.noSeparator)).toBe(false);
	});

	it('takes a row of its own when not fluid, and drops the separator on request', () => {
		const section = sectionOf({ isFluid: false, showSeparator: false });
		expect(section?.classList.contains(panelClasses.fullRow)).toBe(true);
		expect(section?.classList.contains(panelClasses.noSeparator)).toBe(true);
	});
});
