// @vitest-environment jsdom
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StatusStepper } from './statusStepper';
import { renderInDetailPage } from '../audit/auditTestHarness';


vi.mock('@nikkierp/ui/i18n', async importOriginal => {
	const { testI18nMock } = await import('../audit/auditTestI18n');
	return { ...await importOriginal<object>(), ...testI18nMock };
});

afterEach(cleanup);

const STATUSES = [
	{ value: 'draft', label: 'draft' },
	{ value: 'ready', label: 'ready' },
	{ value: 'done', label: 'done' },
	{ value: 'cancelled', label: 'cancelled', alternativeEnd: true },
];

function renderStepper(current: string | null) {
	const { container } = renderInDetailPage(<StatusStepper statuses={STATUSES} current={current} />);
	const steps = [...container.querySelectorAll('nav li')];
	return {
		container,
		stateOf: (label: string) => {
			const step = steps.find(item => item.textContent === `test:${label}`);
			if (step?.getAttribute('aria-current') === 'step') {
				return 'current';
			}
			return step?.querySelector('svg:not(.tabler-icon-arrow-right)') ? 'done' : 'upcoming';
		},
		compact: () => container.querySelector('nav + div')?.textContent ?? null,
	};
}

describe('StatusStepper', () => {
	it('checks the steps before the current one and marks it as the current step', () => {
		const { stateOf, compact } = renderStepper('ready');
		expect(stateOf('draft')).toBe('done');
		expect(stateOf('ready')).toBe('current');
		expect(stateOf('done')).toBe('upcoming');
		expect(compact()).toBe('Step 2 of 3 · test:ready');
	});

	it('separates the linear steps by hidden arrows', () => {
		const { container } = renderStepper('ready');
		const arrows = container.querySelectorAll('nav svg.tabler-icon-arrow-right[aria-hidden="true"]');
		expect(arrows).toHaveLength(2);
	});

	it('shows an alternative end apart from the flow, no linear step reached', () => {
		const { container, stateOf, compact } = renderStepper('cancelled');
		expect(container.querySelector('[aria-current="step"]')?.textContent).toBe('test:cancelled');
		expect(stateOf('draft')).toBe('upcoming');
		expect(compact()).toBe('test:cancelled');
	});

	it('marks nothing current for an unknown status, and offers no compact form', () => {
		const { container, compact } = renderStepper('archived');
		expect(container.querySelector('[aria-current]')).toBeNull();
		expect(compact()).toBeNull();
	});

	it('renders nothing without statuses', () => {
		const { container } = renderInDetailPage(<StatusStepper statuses={[]} current='draft' />);
		expect(container.querySelector('nav')).toBeNull();
	});
});
