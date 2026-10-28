// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AUDIT_OPEN_STORAGE_KEY, loadAuditOpen, useAuditOpen } from './auditOpenStorage';


afterEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
});

describe('useAuditOpen', () => {
	it('starts closed and remembers a toggle under the one shared key', () => {
		const { result } = renderHook(() => useAuditOpen());
		expect(result.current[0]).toBe(false);

		act(() => result.current[1](open => !open));

		expect(result.current[0]).toBe(true);
		expect(localStorage.getItem(AUDIT_OPEN_STORAGE_KEY)).toBe('true');
	});

	it('shares the value with every mounted toggle', () => {
		const first = renderHook(() => useAuditOpen());
		const second = renderHook(() => useAuditOpen());

		act(() => first.result.current[1](true));

		expect(second.result.current[0]).toBe(true);
	});

	it('reads closed when storage is blocked', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(loadAuditOpen()).toBe(false);
	});
});
