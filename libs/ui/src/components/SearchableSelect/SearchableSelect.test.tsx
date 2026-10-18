// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { SearchableSelect } from './SearchableSelect';


const items = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
	globalThis.ResizeObserver ??= class {
		observe(): void { /* jsdom lays nothing out */ }
		unobserve(): void { /* jsdom lays nothing out */ }
		disconnect(): void { /* jsdom lays nothing out */ }
	};
	Element.prototype.scrollIntoView ??= () => undefined;
});

afterEach(cleanup);

type SelectCallbacks = { onChange?: (value: string) => void, onBlur?: () => void };

function openSelect(actionOptionLabel?: string, callbacks: SelectCallbacks = {}): void {
	render(
		<MantineProvider env='test'>
			<SearchableSelect items={items} actionOptionLabel={actionOptionLabel} testId='t.select' {...callbacks} />
		</MantineProvider>,
	);
	fireEvent.click(screen.getByTestId('t.select.trigger'));
}

describe('SearchableSelect action option', () => {
	it('separates the action option from the scrolling list with a divider', () => {
		openSelect('Browse all…');
		const divider = screen.getByTestId('t.select.actionDivider');
		const action = screen.getByTestId('t.select.actionOption');
		expect(divider.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(divider.closest('.mantine-ScrollArea-root')).toBeNull();
		expect(action.closest('.mantine-ScrollArea-root')).toBeNull();
	});

	it('shows no divider without an action option', () => {
		openSelect();
		expect(screen.getByTestId('t.select.option.a')).toBeTruthy();
		expect(screen.queryByTestId('t.select.actionDivider')).toBeNull();
	});
});

describe('SearchableSelect onBlur', () => {
	it('reports the blur after the change when an option is picked', () => {
		const calls: string[] = [];
		openSelect(undefined, { onChange: value => calls.push(`change:${value}`), onBlur: () => calls.push('blur') });
		fireEvent.click(screen.getByTestId('t.select.option.b'));
		expect(calls).toEqual(['change:b', 'blur']);
	});

	it('reports the blur when the dropdown is dismissed', () => {
		const onBlur = vi.fn();
		openSelect(undefined, { onBlur });
		fireEvent.click(screen.getByTestId('t.select.trigger'));
		expect(onBlur).toHaveBeenCalledTimes(1);
	});

	it('leaves the blur to the caller of the action option', () => {
		const onBlur = vi.fn();
		openSelect('Browse all…', { onBlur });
		fireEvent.click(screen.getByTestId('t.select.actionOption'));
		expect(onBlur).not.toHaveBeenCalled();
	});
});
