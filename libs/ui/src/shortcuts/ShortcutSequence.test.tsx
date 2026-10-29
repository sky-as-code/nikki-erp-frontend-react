// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { createShortcutRegistry, getShortcutRegistry } from './registry';
import { ShortcutOverlay } from './ShortcutOverlay';
import { ShortcutSequence, useControlShortcut, useSequenceShortcut, useShortcutSequence } from './ShortcutSequence';
import { press, pressAlt, stubLayout } from './shortcutTestHarness';
import { useShortcut } from './useShortcut';


let restoreLayout: () => void;

beforeAll(() => {
	restoreLayout = stubLayout();
});
afterAll(() => restoreLayout());
afterEach(() => cleanup());

function SequenceButton({ label, onClick, disabled }: { label: string, onClick?: () => void, disabled?: boolean }) {
	const ref = React.useRef<HTMLButtonElement>(null);
	const spec = useSequenceShortcut(ref, { disabled });
	return <button ref={ref} type='button' onClick={onClick} data-spec={spec ?? ''}>{label}</button>;
}

function ControlButton({ label, shortcut }: { label: string, shortcut?: string }) {
	const ref = React.useRef<HTMLButtonElement>(null);
	const spec = useControlShortcut(ref, shortcut);
	const inSequence = useShortcutSequence() !== null;
	return <button ref={ref} type='button' data-spec={spec ?? ''} data-in-sequence={inSequence}>{label}</button>;
}

const specOf = (label: string) => screen.getByText(label).getAttribute('data-spec');

describe('ShortcutSequence', () => {
	it('numbers members in document order, not mount order', () => {
		function Bar({ showFirst }: { showFirst: boolean }) {
			return (
				<ShortcutSequence prefix='Shift+'>
					{showFirst && <SequenceButton label='Create' />}
					<SequenceButton label='Update' />
					<SequenceButton label='Delete' />
				</ShortcutSequence>
			);
		}
		const { rerender } = render(<Bar showFirst={false} />);
		expect([specOf('Update'), specOf('Delete')]).toEqual(['Shift+1', 'Shift+2']);

		rerender(<Bar showFirst />);
		expect([specOf('Create'), specOf('Update'), specOf('Delete')]).toEqual(['Shift+1', 'Shift+2', 'Shift+3']);

		rerender(<Bar showFirst={false} />);
		expect([specOf('Update'), specOf('Delete')]).toEqual(['Shift+1', 'Shift+2']);
	});

	it('stops numbering at max and never past 9', () => {
		const labels = Array.from({ length: 11 }, (_, i) => `B${i}`);
		const buttons = labels.map(label => <SequenceButton key={label} label={label} />);
		const { rerender } = render(<ShortcutSequence max={2}>{buttons}</ShortcutSequence>);
		expect(labels.map(specOf).slice(0, 3)).toEqual(['1', '2', '']);

		rerender(<ShortcutSequence max={20}>{buttons}</ShortcutSequence>);
		expect(specOf('B8')).toBe('9');
		expect(specOf('B9')).toBe('');
	});

	it('runs the numbered control on Alt+prefix+digit', () => {
		const onSave = vi.fn();
		render(
			<ShortcutSequence prefix='Shift+'>
				<SequenceButton label='Discard' />
				<SequenceButton label='Save' onClick={onSave} />
			</ShortcutSequence>,
		);
		act(() => {
			press('keydown', { key: '@', code: 'Digit2', shift: true });
		});
		expect(onSave).toHaveBeenCalledTimes(1);
	});

	it('lets an inner sequence take over its subtree', () => {
		render(
			<ShortcutSequence prefix='Shift+'>
				<SequenceButton label='Outer' />
				<ShortcutSequence>
					<SequenceButton label='Inner' />
				</ShortcutSequence>
			</ShortcutSequence>,
		);
		expect([specOf('Outer'), specOf('Inner')]).toEqual(['Shift+1', '1']);
	});

	it('gives an explicit shortcut precedence over the sequence', () => {
		render(
			<ShortcutSequence>
				<ControlButton label='Explicit' shortcut='O' />
				<ControlButton label='Numbered' />
			</ShortcutSequence>,
		);
		expect([specOf('Explicit'), specOf('Numbered')]).toEqual(['O', '1']);
		expect(screen.getByText('Numbered').getAttribute('data-in-sequence')).toBe('true');
	});

	it('assigns nothing outside a sequence', () => {
		render(<ControlButton label='Alone' />);
		expect(specOf('Alone')).toBe('');
		expect(screen.getByText('Alone').getAttribute('data-in-sequence')).toBe('false');
	});
});

describe('useShortcut', () => {
	function Shortcut({ spec, disabled, onClick }: { spec?: string, disabled?: boolean, onClick: () => void }) {
		const ref = React.useRef<HTMLButtonElement>(null);
		useShortcut(ref, spec, { disabled });
		return <button ref={ref} type='button' onClick={onClick}>Go</button>;
	}

	it('registers while mounted and follows disabled', () => {
		const onClick = vi.fn();
		const { rerender, unmount } = render(<Shortcut spec='G' onClick={onClick} />);
		act(() => {
			press('keydown', { key: 'g', code: 'KeyG' });
		});
		rerender(<Shortcut spec='G' disabled onClick={onClick} />);
		act(() => {
			press('keydown', { key: 'g', code: 'KeyG' });
		});
		expect(onClick).toHaveBeenCalledTimes(1);

		unmount();
		expect(press('keydown', { key: 'g', code: 'KeyG' })).toBe(false);
	});

	it('does nothing without a spec', () => {
		render(<Shortcut onClick={vi.fn()} />);
		expect(getShortcutRegistry().getActiveEntries()).toHaveLength(0);
	});
});

describe('ShortcutOverlay', () => {
	it('draws a badge per shown target only while Alt is held', () => {
		const registry = createShortcutRegistry(window);
		const button = document.createElement('button');
		document.body.appendChild(button);
		registry.register(button, 'Shift+1', { disabled: true });
		render(<ShortcutOverlay registry={registry} />);
		expect(screen.queryByText('⇧ 1')).toBeNull();

		act(() => {
			pressAlt('keydown');
		});
		const keycap = screen.getByText('⇧ 1');
		expect(keycap.parentElement?.hasAttribute('data-disabled')).toBe(true);

		act(() => {
			pressAlt('keyup');
		});
		expect(screen.queryByText('⇧ 1')).toBeNull();
		registry.dispose();
		button.remove();
	});
});
