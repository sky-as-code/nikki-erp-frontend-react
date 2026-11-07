// @vitest-environment jsdom
import { MicroAppHostContext } from '@nikkierp/ui/microApp';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useOwnerLoaded } from './OwnerMicroAppGate';


function hostWith(ensureLoaded: (slug: string) => Promise<void>) {
	const value = { manager: { ensureLoaded } } as unknown as React.ContextType<typeof MicroAppHostContext>;
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return <MicroAppHostContext.Provider value={value}>{children}</MicroAppHostContext.Provider>;
	};
}

describe('useOwnerLoaded', () => {
	it('loads the owner once and becomes ready', async () => {
		const ensureLoaded = vi.fn(() => Promise.resolve());
		const { result, rerender } = renderHook(() => useOwnerLoaded('commerce'), { wrapper: hostWith(ensureLoaded) });

		expect(result.current).toBe('loading');
		await waitFor(() => expect(result.current).toBe('ready'));
		rerender();
		expect(ensureLoaded).toHaveBeenCalledTimes(1);
		expect(ensureLoaded).toHaveBeenCalledWith('commerce');
	});

	it('reports a failed load', async () => {
		const { result } = renderHook(() => useOwnerLoaded('commerce'), {
			wrapper: hostWith(() => Promise.reject(new Error('offline'))),
		});

		await waitFor(() => expect(result.current).toBe('failed'));
	});

	it('is ready at once without a host', () => {
		const { result } = renderHook(() => useOwnerLoaded('commerce'));

		expect(result.current).toBe('ready');
	});
});
