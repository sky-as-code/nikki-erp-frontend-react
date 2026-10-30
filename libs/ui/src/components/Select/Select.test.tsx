// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { firstSelectableItem } from './autoSelectItem';
import { Select } from './Select';

import type { SelectProps } from './Select';


beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});
afterEach(cleanup);

const OPTIONS = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

function renderSelect(props: SelectProps) {
	const view = render(<MantineProvider><Select aria-label='pick' {...props} /></MantineProvider>);
	return {
		...view,
		rerenderWith: (next: SelectProps) => view.rerender(
			<MantineProvider><Select aria-label='pick' {...next} /></MantineProvider>,
		),
	};
}

const input = () => document.querySelector('input[aria-label="pick"]:not([type=hidden])') as HTMLInputElement;

describe('firstSelectableItem', () => {
	it('flattens groups and skips disabled options', () => {
		const data = [
			{ group: 'G1', items: [{ value: 'x', label: 'X', disabled: true }] },
			{ group: 'G2', items: [{ value: 'y', label: 'Y' }] },
		];
		expect(firstSelectableItem(data)?.value).toBe('y');
		expect(firstSelectableItem(['s', 't'])).toEqual({ value: 's', label: 's' });
		expect(firstSelectableItem([])).toBeUndefined();
	});
});

describe('Select autoSelectItem', () => {
	it('does nothing by default', () => {
		const onChange = vi.fn();
		renderSelect({ data: OPTIONS, value: null, onChange });
		expect(onChange).not.toHaveBeenCalled();
	});

	it('picks the first option of a controlled select holding null', () => {
		const onChange = vi.fn();
		renderSelect({ data: OPTIONS, value: null, onChange, autoSelectItem: true });
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith('a', expect.objectContaining({ value: 'a', label: 'Alpha' }));
	});

	it('keeps a value given from outside', () => {
		const onChange = vi.fn();
		renderSelect({ data: OPTIONS, value: 'b', onChange, autoSelectItem: true });
		renderSelect({ data: OPTIONS, defaultValue: 'b', onChange, autoSelectItem: true });
		expect(onChange).not.toHaveBeenCalled();
	});

	it('waits for async data and does not loop when the parent keeps null', () => {
		const onChange = vi.fn();
		const view = renderSelect({ data: [], value: null, onChange, autoSelectItem: true });
		expect(onChange).not.toHaveBeenCalled();
		view.rerenderWith({ data: OPTIONS, value: null, onChange, autoSelectItem: true });
		view.rerenderWith({ data: [...OPTIONS], value: null, onChange, autoSelectItem: true });
		expect(onChange).toHaveBeenCalledTimes(1);
		view.rerenderWith({ data: [{ value: 'c', label: 'Gamma' }], value: null, onChange, autoSelectItem: true });
		expect(onChange).toHaveBeenCalledTimes(2);
		expect(onChange).toHaveBeenLastCalledWith('c', expect.objectContaining({ value: 'c' }));
	});

	it('shows the pick in an uncontrolled select', () => {
		const onChange = vi.fn();
		renderSelect({ data: OPTIONS, onChange, autoSelectItem: true });
		expect(input().value).toBe('Alpha');
		expect(onChange).toHaveBeenCalledWith('a', expect.objectContaining({ value: 'a' }));
	});

	it('picks inside grouped data', () => {
		const onChange = vi.fn();
		renderSelect({ data: [{ group: 'G', items: OPTIONS }], value: null, onChange, autoSelectItem: true });
		expect(onChange).toHaveBeenCalledWith('a', expect.objectContaining({ value: 'a' }));
	});
});
