// @vitest-environment jsdom
import { MantineProvider, Menu } from '@mantine/core';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { ShortcutSequence } from '../../shortcuts';
import { press, stubLayout } from '../../shortcuts/shortcutTestHarness';
import { Input } from '../Input';


const showLocked = vi.fn();

vi.mock('../ErrorState', () => ({
	useShowLockedFeature: () => showLocked,
}));

let restoreLayout: () => void;

beforeAll(() => {
	restoreLayout = stubLayout();
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});
afterAll(() => restoreLayout());
afterEach(() => {
	cleanup();
	showLocked.mockReset();
});

const renderInMantine = (ui: React.ReactNode) => render(<MantineProvider>{ui}</MantineProvider>);
const byText = (label: string) => screen.getByText(label).closest('button, a') as HTMLElement;
const pressAltShift = (digit: number) => act(() => {
	press('keydown', { key: String(digit), code: `Digit${digit}`, shift: true });
});

describe('Button shortcut', () => {
	it('clicks on its explicit shortcut and announces it', () => {
		const onClick = vi.fn();
		renderInMantine(<Button shortcut='/' onClick={onClick}>Filters</Button>);
		expect(byText('Filters').getAttribute('aria-keyshortcuts')).toBe('Alt+/');

		act(() => {
			press('keydown', { key: '/', code: 'Slash' });
		});
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('is numbered by an enclosing sequence, in visual order', () => {
		const onSave = vi.fn();
		renderInMantine(
			<ShortcutSequence prefix='Shift+'>
				<Button>Discard</Button>
				<Button onClick={onSave}>Save</Button>
			</ShortcutSequence>,
		);
		expect(byText('Discard').getAttribute('aria-keyshortcuts')).toBe('Alt+Shift+1');
		expect(byText('Save').getAttribute('aria-keyshortcuts')).toBe('Alt+Shift+2');

		pressAltShift(2);
		expect(onSave).toHaveBeenCalledTimes(1);
	});

	it('still clicks a locked button, so the refusal shows', () => {
		renderInMantine(
			<ShortcutSequence prefix='Shift+'>
				<Button locked lockedMissing={['x.create']}>Create</Button>
			</ShortcutSequence>,
		);
		pressAltShift(1);
		expect(showLocked).toHaveBeenCalledWith(['x.create']);
	});

	it('keeps a ref handed in by Menu.Target and numbers the trigger', () => {
		renderInMantine(
			<ShortcutSequence prefix='Shift+'>
				<Button>Update</Button>
				<Menu>
					<Menu.Target>
						<Button aria-label='More'>...</Button>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item>Delete</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</ShortcutSequence>,
		);
		const trigger = screen.getByLabelText('More');
		expect(trigger.getAttribute('aria-keyshortcuts')).toBe('Alt+Shift+2');

		pressAltShift(2);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('leaves buttons in a portal opened from the bar out of its numbering', () => {
		renderInMantine(
			<ShortcutSequence prefix='Shift+'>
				<Button>Update</Button>
				<div data-portal='true'><Button>Confirm</Button></div>
			</ShortcutSequence>,
		);
		expect(byText('Confirm').hasAttribute('aria-keyshortcuts')).toBe(false);
	});
});

describe('Input shortcut', () => {
	it('focuses on its shortcut and never joins a sequence', () => {
		renderInMantine(
			<ShortcutSequence prefix='Shift+'>
				<Input aria-label='page' shortcut='P' />
				<Input aria-label='other' />
			</ShortcutSequence>,
		);
		const input = screen.getByLabelText('page');
		expect(input.getAttribute('aria-keyshortcuts')).toBe('Alt+P');
		expect(screen.getByLabelText('other').hasAttribute('aria-keyshortcuts')).toBe(false);

		act(() => {
			press('keydown', { key: 'p', code: 'KeyP' });
		});
		expect(document.activeElement).toBe(input);
	});
});
