// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ColumnHeaderLabel, FieldDescriptionMark } from './FieldDescription';


beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});
beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

const renderInMantine = (ui: React.ReactNode) => render(<MantineProvider env='test'>{ui}</MantineProvider>);
const card = () => screen.queryByTestId('fieldDescription.tooltip');
const advance = (ms: number) => act(() => {
	vi.advanceTimersByTime(ms);
});

describe('FieldDescriptionMark', () => {
	it('renders nothing without a description', () => {
		renderInMantine(<FieldDescriptionMark description='' />);
		expect(screen.queryByTestId('fieldDescription.mark')).toBeNull();
	});

	it('opens at once and closes 500 ms after the pointer leaves', () => {
		renderInMantine(<FieldDescriptionMark description={'Kind\n* a: first'} />);
		fireEvent.mouseEnter(screen.getByTestId('fieldDescription.mark'));
		expect(card()?.textContent).toBe('Kind\n* a: first');

		fireEvent.mouseLeave(screen.getByTestId('fieldDescription.mark'));
		advance(450);
		expect(card()).not.toBeNull();
		advance(100);
		expect(card()).toBeNull();
	});

	it('stays open while the pointer is over the card', () => {
		renderInMantine(<FieldDescriptionMark description='Kind' />);
		fireEvent.mouseEnter(screen.getByTestId('fieldDescription.mark'));
		fireEvent.mouseLeave(screen.getByTestId('fieldDescription.mark'));
		advance(200);
		fireEvent.mouseEnter(card()!);
		advance(2000);
		expect(card()).not.toBeNull();

		fireEvent.mouseLeave(card()!);
		advance(500);
		expect(card()).toBeNull();
	});
});

describe('ColumnHeaderLabel', () => {
	it('opens only after a deliberate hover and stays while hovered', () => {
		renderInMantine(<ColumnHeaderLabel label='Qty' description='How many' />);
		fireEvent.mouseEnter(screen.getByText('Qty'));
		advance(900);
		expect(card()).toBeNull();
		advance(100);
		expect(card()).not.toBeNull();

		fireEvent.mouseLeave(screen.getByText('Qty'));
		fireEvent.mouseEnter(card()!);
		advance(2000);
		expect(card()).not.toBeNull();
	});
});
