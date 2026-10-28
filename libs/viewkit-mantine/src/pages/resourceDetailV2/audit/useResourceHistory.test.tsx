// @vitest-environment jsdom
import { fetchResourceHistory } from '@nikkierp/common/service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EMPTY_HISTORY, mergeHistoryPage, useResourceHistory } from './useResourceHistory';

import type { ResourceHistoryItem, ResourceHistoryResponse } from '@nikkierp/common/service';


vi.mock('@nikkierp/common/service', () => ({ fetchResourceHistory: vi.fn() }));

function entry(id: string): ResourceHistoryItem {
	return {
		id, action: 'update', created_at: '2026-10-09T10:00:00Z',
		actor: { type: 'user', display_name: 'Ann' }, changes: [], masked_fields: [],
	};
}

function page(ids: string[], total: number, pageNo = 0): ResourceHistoryResponse {
	return { items: ids.map(entry), total, page: pageNo, size: 2 };
}

function answer(response: ResourceHistoryResponse): void {
	vi.mocked(fetchResourceHistory).mockResolvedValueOnce({ data: response, clientErrors: [] });
}

afterEach(() => {
	vi.mocked(fetchResourceHistory).mockReset();
});

describe('mergeHistoryPage', () => {
	it('replaces on the first page and appends later ones without repeating shifted entries', () => {
		const first = mergeHistoryPage(EMPTY_HISTORY, 0, page(['a', 'b'], 3), []);
		expect(first.items.map(item => item.id)).toEqual(['a', 'b']);
		expect(first.loadedPages).toBe(1);

		const second = mergeHistoryPage(first, 1, page(['b', 'c'], 4, 1), []);
		expect(second.items.map(item => item.id)).toEqual(['a', 'b', 'c']);
		expect(second.total).toBe(4);

		const reloaded = mergeHistoryPage(second, 0, page(['z'], 5), []);
		expect(reloaded.items.map(item => item.id)).toEqual(['z']);
	});

	it('keeps the list and reports a refusal', () => {
		const first = mergeHistoryPage(EMPTY_HISTORY, 0, page(['a'], 1), []);
		const refused = mergeHistoryPage(first, 0, null, [{ key: 'err_forbidden', message: 'no' } as never]);
		expect(refused.items).toHaveLength(1);
		expect(refused.clientErrors).toHaveLength(1);
	});
});

describe('useResourceHistory', () => {
	it('fetches nothing while disabled', () => {
		renderHook(() => useResourceHistory('iam_user', 'U1', { enabled: false }));
		expect(fetchResourceHistory).not.toHaveBeenCalled();
	});

	it('loads the first page, then the next one on demand', async () => {
		answer(page(['a', 'b'], 3));
		const { result } = renderHook(() => useResourceHistory('iam_user', 'U1', { enabled: true, pageSize: 2 }));
		await waitFor(() => expect(result.current.items).toHaveLength(2));
		expect(result.current.hasMore).toBe(true);
		expect(fetchResourceHistory).toHaveBeenCalledWith({ resourceCode: 'iam_user', resourceId: 'U1', page: 0, size: 2 });

		answer(page(['c'], 3, 1));
		act(() => result.current.loadMore());
		await waitFor(() => expect(result.current.items).toHaveLength(3));
		expect(result.current.hasMore).toBe(false);
	});

	it('reloads the first page when the refresh key changes', async () => {
		answer(page(['a'], 1));
		const { result, rerender } = renderHook(
			({ refreshKey }) => useResourceHistory('iam_user', 'U1', { enabled: true, refreshKey }),
			{ initialProps: { refreshKey: {} as unknown } },
		);
		await waitFor(() => expect(result.current.items).toHaveLength(1));

		answer(page(['b', 'a'], 2));
		rerender({ refreshKey: {} });
		await waitFor(() => expect(result.current.items.map(item => item.id)).toEqual(['b', 'a']));
	});

	it('surfaces a technical failure', async () => {
		vi.mocked(fetchResourceHistory).mockRejectedValueOnce(new Error('down'));
		const { result } = renderHook(() => useResourceHistory('iam_user', 'U1', { enabled: true }));
		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
		expect(result.current.isLoading).toBe(false);
	});
});
