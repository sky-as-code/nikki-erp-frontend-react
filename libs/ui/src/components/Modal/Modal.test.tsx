// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';
import { getShortcutRegistry, useShortcut } from '../../shortcuts';
import { press, stubLayout } from '../../shortcuts/shortcutTestHarness';


let restoreLayout: () => void;

beforeAll(() => {
	restoreLayout = stubLayout();
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});
afterAll(() => restoreLayout());
afterEach(() => cleanup());

const instant = { duration: 0 };

function KeyButton({ spec, onClick, label }: { spec: string, onClick: () => void, label: string }) {
	const ref = React.useRef<HTMLButtonElement>(null);
	useShortcut(ref, spec);
	return <button ref={ref} onClick={onClick}>{label}</button>;
}

const pressKey = (letter: string) => act(() => {
	press('keydown', { key: letter.toLowerCase(), code: `Key${letter}` });
});
const activeLabels = () => getShortcutRegistry().getActiveEntries().map(entry => entry.element.textContent).sort();

type HarnessProps = { outer: boolean, inner?: boolean, onPage: () => void, onOuter: () => void, onInner?: () => void };

function Harness({ outer, inner = false, onPage, onOuter, onInner = () => undefined }: HarnessProps) {
	return (
		<MantineProvider>
			<KeyButton spec='P' label='Page' onClick={onPage} />
			<Modal opened={outer} onClose={() => undefined} transitionProps={instant} title='Outer'>
				<KeyButton spec='O' label='Outer' onClick={onOuter} />
				<Modal opened={inner} onClose={() => undefined} transitionProps={instant} title='Inner'>
					<KeyButton spec='I' label='Inner' onClick={onInner} />
				</Modal>
			</Modal>
		</MantineProvider>
	);
}

describe('Modal shortcut scope', () => {
	it('disables page keys while open and restores them on close', async () => {
		const onPage = vi.fn();
		const onOuter = vi.fn();
		const view = render(<Harness outer onPage={onPage} onOuter={onOuter} />);

		pressKey('P');
		pressKey('O');
		expect(onPage).not.toHaveBeenCalled();
		expect(onOuter).toHaveBeenCalledTimes(1);
		expect(activeLabels()).toEqual(['Outer']);

		view.rerender(<Harness outer={false} onPage={onPage} onOuter={onOuter} />);
		await waitFor(() => expect(getShortcutRegistry().getActiveScope()).toBeNull());
		pressKey('P');
		expect(onPage).toHaveBeenCalledTimes(1);
	});

	it('gives the keys to the topmost of stacked modals', async () => {
		const onOuter = vi.fn();
		const onInner = vi.fn();
		const props = { onPage: vi.fn(), onOuter, onInner };
		const view = render(<Harness outer inner {...props} />);

		pressKey('O');
		pressKey('I');
		expect(onOuter).not.toHaveBeenCalled();
		expect(onInner).toHaveBeenCalledTimes(1);
		expect(activeLabels()).toEqual(['Inner']);

		view.rerender(<Harness outer inner={false} {...props} />);
		await waitFor(() => expect(activeLabels()).toEqual(['Outer']));
		pressKey('O');
		expect(onOuter).toHaveBeenCalledTimes(1);
	});

	it('scopes the compound form through Modal.Content', () => {
		const onPage = vi.fn();
		const onSave = vi.fn();
		render(
			<MantineProvider>
				<KeyButton spec='P' label='Page' onClick={onPage} />
				<Modal.Root opened onClose={() => undefined} transitionProps={instant}>
					<Modal.Content>
						<Modal.Body><KeyButton spec='S' label='Save' onClick={onSave} /></Modal.Body>
					</Modal.Content>
				</Modal.Root>
			</MantineProvider>,
		);

		pressKey('P');
		pressKey('S');
		expect(onPage).not.toHaveBeenCalled();
		expect(onSave).toHaveBeenCalledTimes(1);
	});
});
