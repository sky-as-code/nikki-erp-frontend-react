// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { useWatchedFormValues } from './useWatchedFormValues';

import type { UseFormReturn } from 'react-hook-form';


const runtime: { form?: UseFormReturn<any> } = {};

vi.mock('./formContext', () => ({
	useCrudFormRuntime: () => (runtime.form ? { form: runtime.form } : null),
}));

function renderWatched(names: string[]) {
	return renderHook(() => {
		runtime.form = useForm({ defaultValues: { flow: 'one_step', other: 1 } });
		return useWatchedFormValues(names);
	});
}

describe('useWatchedFormValues', () => {
	it('reads the watched fields and follows their changes', () => {
		const { result } = renderWatched(['flow']);
		expect(result.current).toEqual({ flow: 'one_step' });

		act(() => runtime.form!.setValue('flow', 'two_step'));
		expect(result.current).toEqual({ flow: 'two_step' });
	});

	it('gives nothing for no names', () => {
		expect(renderWatched([]).result.current).toBeNull();
	});
});
