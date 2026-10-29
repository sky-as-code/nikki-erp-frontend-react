// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { MaskInput } from './MaskInput';
import { resourceCodeMaskProps } from '../form/resourceCodeField';


beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});
afterEach(() => cleanup());

function renderCodeInput(value: string, maxLength?: number) {
	const onChangeRaw = vi.fn();
	const view = render(
		<MantineProvider>
			<MaskInput aria-label='code' value={value} onChangeRaw={onChangeRaw} {...resourceCodeMaskProps(maxLength)} />
		</MantineProvider>,
	);
	const input = screen.getByLabelText('code') as HTMLInputElement;
	input.focus();
	input.setSelectionRange(input.value.length, input.value.length);
	return { input, onChangeRaw, view };
}

function paste(input: HTMLInputElement, text: string) {
	fireEvent.paste(input, { clipboardData: { getData: () => text } });
}

describe('MaskInput with the resource code mask', () => {
	it('shows the given value without reporting it back as an edit', () => {
		const { input, onChangeRaw } = renderCodeInput('WH-A1');
		expect(input.value).toBe('WH-A1');
		expect(onChangeRaw).not.toHaveBeenCalled();
	});

	it('uppercases typed letters and drops characters outside A-Z, 0-9 and -', () => {
		const { input, onChangeRaw } = renderCodeInput('WH');
		fireEvent.keyDown(input, { key: 'a' });
		fireEvent.keyDown(input, { key: '_' });
		fireEvent.keyDown(input, { key: ' ' });
		fireEvent.keyDown(input, { key: '-' });
		expect(input.value).toBe('WHA-');
		expect(onChangeRaw).toHaveBeenLastCalledWith('WHA-', 'WHA-');
	});

	it('edits the value it was given: backspace removes the last character', () => {
		const { input, onChangeRaw } = renderCodeInput('WH-A1');
		fireEvent.keyDown(input, { key: 'Backspace' });
		expect(input.value).toBe('WH-A');
		expect(onChangeRaw).toHaveBeenLastCalledWith('WH-A', 'WH-A');
	});

	it('filters a pasted code', () => {
		const { input } = renderCodeInput('');
		paste(input, 'wh-a_1');
		expect(input.value).toBe('WH-A1');
	});

	it('stops at the maximum length', () => {
		const { input } = renderCodeInput('ABC', 5);
		paste(input, 'defgh');
		expect(input.value).toBe('ABCDE');
		fireEvent.keyDown(input, { key: 'F' });
		expect(input.value).toBe('ABCDE');
	});

	it('follows a new value from outside', () => {
		const { input, view, onChangeRaw } = renderCodeInput('OLD');
		view.rerender(
			<MantineProvider>
				<MaskInput aria-label='code' value='NEW-1' onChangeRaw={onChangeRaw} {...resourceCodeMaskProps()} />
			</MantineProvider>,
		);
		expect(input.value).toBe('NEW-1');
		fireEvent.keyDown(input, { key: 'Backspace' });
		expect(input.value).toBe('NEW-');
	});
});
