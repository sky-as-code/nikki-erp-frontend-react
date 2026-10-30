// @vitest-environment jsdom
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { cleanup, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { byTestId, renderInDetailPage, TEST_STATUSES } from './audit/auditTestHarness';
import { resourceStatusStripRenderer } from './form/resourceStatusStrip';
import { ResourceActionBar } from './resourceUpdateParts';
import { withStatusStrip } from './statusPlacement';
import { COLLAPSIBLE_SECTION, RESOURCE_DETAIL_STATUS_STRIP, RESOURCE_FORM_TABS } from '../../ids';

import type { StatusPlacement } from './resourceUpdateContext';


vi.mock('@nikkierp/ui/i18n', async importOriginal => {
	const { testI18nMock } = await import('./audit/auditTestI18n');
	return { ...await importOriginal<object>(), ...testI18nMock };
});

vi.mock('../../permissions', async importOriginal => {
	const unlocked = { locked: false, missing: [] };
	return {
		...await importOriginal<object>(),
		useActionLock: () => unlocked,
		useAnyFieldActionLock: () => unlocked,
	};
});

afterEach(cleanup);

const section = defineComponent({
	component: COLLAPSIBLE_SECTION, props: {}, children: [defineComponent({ component: 'column' })],
});

describe('withStatusStrip', () => {
	it('leaves the sections alone for the toolbar placement or a page without statuses', () => {
		expect(withStatusStrip([section], 'toolbar', true)).toEqual([section]);
		expect(withStatusStrip([section], undefined, true)).toEqual([section]);
		expect(withStatusStrip([section], 'firstSection', false)).toEqual([section]);
	});

	it('puts the strip first in the first section', () => {
		const [first, ...rest] = withStatusStrip([section, section], 'firstSection', true);
		expect(first.children?.map(child => child.component)).toEqual([RESOURCE_DETAIL_STATUS_STRIP, 'column']);
		expect(rest).toEqual([section]);
		expect(section.children).toHaveLength(1);
	});

	it('puts an inline strip in the first section header for firstSectionHeader', () => {
		const [first, ...rest] = withStatusStrip([section, section], 'firstSectionHeader', true);
		const rightSegment = first.props?.rightSegment as { component: string, props: { inline: boolean } };
		expect(rightSegment.component).toBe(RESOURCE_DETAIL_STATUS_STRIP);
		expect(rightSegment.props.inline).toBe(true);
		expect(first.children).toEqual(section.children);
		expect(rest).toEqual([section]);
		expect(section.props).toEqual({});
	});

	it('puts the strip before a first node that is not a section', () => {
		const tabs = defineComponent({ component: RESOURCE_FORM_TABS, props: {} });
		const nodes = withStatusStrip([tabs], 'firstSection', true);
		expect(nodes.map(node => node.component)).toEqual([RESOURCE_DETAIL_STATUS_STRIP, RESOURCE_FORM_TABS]);
	});
});

function renderActionBar(statusPlacement: StatusPlacement, updateMode = false) {
	return renderInDetailPage(
		<ResourceActionBar
			onSaveClick={() => undefined} isLoading={false} updateMode={updateMode} setUpdateMode={() => undefined}
		/>,
		{ allStatuses: TEST_STATUSES, currentStatus: { schemaField: 'status' }, statusPlacement },
	);
}

describe('status placement', () => {
	it('shows the status flow in the right toolbar, beside the Audit toggle, by default', () => {
		renderActionBar('toolbar');
		const toolbar = screen.getByTestId(byTestId('rightToolbar'));
		expect(toolbar.textContent).toContain('Active');
		expect(toolbar.textContent).toContain('Suspended');
		expect(toolbar.querySelector(`[data-testid="${byTestId('auditToggle')}"]`)).not.toBeNull();
	});

	it('keeps only the Audit toggle on the right in update mode', () => {
		renderActionBar('toolbar', true);
		const toolbar = screen.getByTestId(byTestId('rightToolbar'));
		expect(toolbar.textContent).toBe('Audit');
	});

	it.each(['firstSection', 'firstSectionHeader'] as const)(
		'leaves the toolbar to the toggle when the page moves the strip to %s', placement => {
			renderActionBar(placement);
			expect(screen.getByTestId(byTestId('rightToolbar')).textContent).toBe('Audit');
		},
	);

	it('renders the strip as a full row, the current status marked', () => {
		renderInDetailPage(
			<>{resourceStatusStripRenderer.render({ inline: false }, {} as never)}</>,
			{ allStatuses: TEST_STATUSES, currentStatus: { schemaField: 'status' }, statusPlacement: 'firstSection' },
		);
		const strip = screen.getByTestId(byTestId('statusStrip'));
		expect(strip.querySelector('[data-current="true"]')?.textContent).toBe('Active');
	});
});
