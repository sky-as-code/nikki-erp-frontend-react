// @vitest-environment jsdom
import { fetchResourceHistory } from '@nikkierp/common/service';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { auditLayoutRenderer } from './AuditLayout';
import { byTestId, renderInDetailPage } from './auditTestHarness';
import { AuditToggleButton } from './AuditToggleButton';

import type { ResourceHistoryItem } from '@nikkierp/common/service';
import type { ComponentRenderRuntime } from '@nikkierp/viewengine/core';


vi.mock('@nikkierp/ui/i18n', async importOriginal => {
	const { testI18nMock } = await import('./auditTestI18n');
	return { ...await importOriginal<object>(), ...testI18nMock };
});

vi.mock('../../../data/useRelatedSchemas', async () => {
	const { TEST_RELATED_SCHEMAS } = await import('./auditTestHarness');
	return { useRelatedSchemas: () => TEST_RELATED_SCHEMAS };
});

vi.mock('@nikkierp/common/service', async importOriginal => ({
	...await importOriginal<object>(),
	fetchResourceHistory: vi.fn(),
}));

afterEach(() => {
	cleanup();
	vi.mocked(fetchResourceHistory).mockReset();
});

const ACTOR = { id: 'A1', type: 'user' as const, display_name: 'Ann Lee', avatar_file_id: null };

const HISTORY: ResourceHistoryItem[] = [
	{
		id: 'H3', action: 'update', created_at: '2026-10-09T12:30:00Z', actor: ACTOR, masked_fields: ['display_name'],
		changes: [
			{ field: 'status', old: 'active', new: 'suspended' },
			{ field: 'display_name', old: null, new: null },
		],
	},
	{
		id: 'H2', action: 'suspend', created_at: '2026-10-09T12:00:00Z', actor: ACTOR, masked_fields: [],
		changes: [{ field: 'status', old: 'active', new: 'suspended' }],
	},
	{
		id: 'H4', action: 'link', created_at: '2026-10-09T13:00:00Z', actor: ACTOR, masked_fields: [],
		changes: [{
			field: 'roles', old: null, new: ['R1', 'R2', 'R3'],
			labels: { R1: 'Role name 1', R2: 'Role name 2' },
		}],
	},
	{
		id: 'H5', action: 'update', created_at: '2026-10-09T13:10:00Z', actor: ACTOR, masked_fields: [],
		changes: [{ field: 'manager_id', old: [], new: 'U9', labels: { U9: 'Bob' } }],
	},
	{
		id: 'H1', action: 'create', created_at: '2026-10-08T12:00:00Z', masked_fields: [],
		actor: { type: 'system' }, changes: [{ field: 'display_name', old: null, new: 'Ann' }],
	},
];

function answerHistory(items: ResourceHistoryItem[]): void {
	vi.mocked(fetchResourceHistory).mockResolvedValue({
		data: { items, total: items.length, page: 0, size: 20 }, clientErrors: [],
	});
}

function renderDetailBody() {
	const runtime = { children: [] } as unknown as ComponentRenderRuntime;
	return renderInDetailPage(
		<>
			<AuditToggleButton />
			{auditLayoutRenderer.render({}, runtime)}
		</>,
	);
}

const toggle = () => screen.getByTestId(byTestId('auditToggle'));
const panel = () => screen.queryByTestId(byTestId('auditPanel'));

describe('Audit panel', () => {
	it('opens from the toolbar toggle and closes from its X, turning the toggle off', async () => {
		answerHistory([]);
		renderDetailBody();
		expect(panel()).toBeNull();
		expect(toggle().getAttribute('aria-pressed')).toBe('false');
		expect(toggle().getAttribute('data-variant')).toBe('outline');

		fireEvent.click(toggle());
		expect(panel()).not.toBeNull();
		expect(toggle().getAttribute('aria-pressed')).toBe('true');
		expect(toggle().getAttribute('data-variant')).toBe('filled');

		fireEvent.click(screen.getByTestId(byTestId('auditClose')));
		expect(toggle().getAttribute('aria-pressed')).toBe('false');
		await waitFor(() => expect(panel()).toBeNull());
	});

	it('the toggle closes the panel too', async () => {
		answerHistory([]);
		renderDetailBody();
		fireEvent.click(toggle());
		fireEvent.click(toggle());
		await waitFor(() => expect(panel()).toBeNull());
	});

	it('shows an empty Comments tab', async () => {
		answerHistory([]);
		renderDetailBody();
		fireEvent.click(toggle());
		fireEvent.click(screen.getByTestId(byTestId('auditTab', 'comments')));
		expect(await screen.findByText('No comments yet.')).toBeTruthy();
	});
});

describe('Audit panel on a narrow screen', () => {
	const original = window.matchMedia;
	afterEach(() => {
		window.matchMedia = original;
	});

	it('opens as a full-screen dialog whose only button is the X, which turns the toggle off', async () => {
		answerHistory([]);
		window.matchMedia = (query: string) => ({
			matches: query.includes('56em'), media: query, onchange: null,
			addListener: () => undefined, removeListener: () => undefined,
			addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
		});
		renderDetailBody();
		fireEvent.click(toggle());

		const dialog = await screen.findByRole('dialog');
		expect(within(dialog).getByTestId(byTestId('auditPanel'))).toBeTruthy();
		expect(dialog.querySelector('.mantine-Modal-close')).toBeNull();
		expect(document.querySelector('[data-full-screen="true"]')).not.toBeNull();

		fireEvent.click(within(dialog).getByTestId(byTestId('auditClose')));
		expect(toggle().getAttribute('aria-pressed')).toBe('false');
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
	});
});

describe('History tab', () => {
	it('asks for this record\'s history and says when there is none', async () => {
		answerHistory([]);
		renderDetailBody();
		fireEvent.click(toggle());
		expect(await screen.findByText('No history yet.')).toBeTruthy();
		expect(fetchResourceHistory).toHaveBeenCalledWith(expect.objectContaining({
			resourceCode: 'iam_user', resourceId: 'U1', page: 0,
		}));
	});

	it('lists entries under day dividers: a creation as a message, an update as old → new lines', async () => {
		answerHistory(HISTORY);
		renderDetailBody();
		fireEvent.click(toggle());

		const created = await screen.findByTestId(byTestId('auditEntry', 'H1'));
		expect(within(created).getByText('User created')).toBeTruthy();
		expect(within(created).getByText('System')).toBeTruthy();
		expect(within(created).queryByRole('listitem')).toBeNull();

		const updated = screen.getByTestId(byTestId('auditEntry', 'H3'));
		expect(within(updated).getByText('Ann Lee')).toBeTruthy();
		const statusLine = within(updated).getByTestId(byTestId('auditChange', 'status'));
		expect(statusLine.textContent).toBe('Active → Suspended (Status)');

		expect(screen.getByText('Oct 9, 2026')).toBeTruthy();
		expect(screen.getByText('Oct 8, 2026')).toBeTruthy();
	});

	it('renders a masked change as a lock, never its values', async () => {
		answerHistory(HISTORY);
		renderDetailBody();
		fireEvent.click(toggle());

		const masked = await screen.findByTestId(byTestId('auditChange', 'display_name'));
		expect(masked.querySelector('[data-locked="true"]')).not.toBeNull();
		expect(masked.textContent).toBe(' (Display name)');
	});

	it('names a custom action by the page\'s label and lists what it changed', async () => {
		answerHistory(HISTORY);
		renderDetailBody();
		fireEvent.click(toggle());

		const suspended = await screen.findByTestId(byTestId('auditEntry', 'H2'));
		expect(within(suspended).getByText('Action: Suspend')).toBeTruthy();
		expect(within(suspended).getAllByRole('listitem')).toHaveLength(1);
	});

	it('shows a link as the labels of the linked records, under the label of the peer', async () => {
		answerHistory(HISTORY);
		renderDetailBody();
		fireEvent.click(toggle());

		const line = await screen.findByTestId(byTestId('auditChange', 'roles'));
		expect(line.textContent).toBe('- → Role name 1, Role name 2, R3 (Roles)');
	});

	it('shows a foreign key by its label, and an empty value as -', async () => {
		answerHistory(HISTORY);
		renderDetailBody();
		fireEvent.click(toggle());

		const line = await screen.findByTestId(byTestId('auditChange', 'manager_id'));
		expect(line.textContent?.startsWith('- → Bob (')).toBe(true);
	});

	it('reports a failed load with a way to retry', async () => {
		vi.mocked(fetchResourceHistory).mockRejectedValue(new Error('down'));
		renderDetailBody();
		fireEvent.click(toggle());
		expect(await screen.findByText('The history could not be loaded.')).toBeTruthy();
		expect(screen.getByText('Refresh')).toBeTruthy();
	});
});
