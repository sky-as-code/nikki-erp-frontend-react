// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createShortcutRegistry } from './registry';
import { addButton, press, stubLayout } from './shortcutTestHarness';

import type { ShortcutRegistry } from './registry';


let restoreLayout: () => void;
let registry: ShortcutRegistry;

beforeAll(() => {
	restoreLayout = stubLayout();
});
afterAll(() => restoreLayout());
beforeEach(() => {
	registry = createShortcutRegistry(window);
});
afterEach(() => {
	registry.dispose();
	document.body.innerHTML = '';
	vi.restoreAllMocks();
});

function addContainer(attributes: Record<string, string> = {}): HTMLDivElement {
	const container = document.createElement('div');
	Object.entries(attributes).forEach(([name, value]) => container.setAttribute(name, value));
	document.body.appendChild(container);
	return container;
}

function addButtonIn(container: Element, label: string, spec: string): ReturnType<typeof vi.fn> {
	const button = addButton(label);
	container.appendChild(button);
	const onClick = vi.fn();
	button.addEventListener('click', onClick);
	registry.register(button, spec);
	return onClick;
}

const pressKey = (letter: string) => press('keydown', { key: letter.toLowerCase(), code: `Key${letter}` });
const activeLabels = () => registry.getActiveEntries().map(entry => entry.element.textContent);

describe('pushed scopes', () => {
	it('fires only the keys inside the scope, and restores the page when popped', () => {
		const onPage = addButtonIn(document.body, 'Page', 'P');
		const modal = addContainer();
		const onSave = addButtonIn(modal, 'Save', 'S');
		const pop = registry.pushScope(modal);

		pressKey('P');
		pressKey('S');
		expect(onPage).not.toHaveBeenCalled();
		expect(onSave).toHaveBeenCalledTimes(1);
		expect(activeLabels()).toEqual(['Save']);

		pop();
		pop();
		pressKey('P');
		expect(onPage).toHaveBeenCalledTimes(1);
		expect(activeLabels()).toEqual(['Page', 'Save']);
	});

	it('gives the keys to the last scope in document order, then back when it closes', () => {
		const outer = addContainer();
		const onOuter = addButtonIn(outer, 'Outer', 'O');
		const inner = addContainer();
		const onInner = addButtonIn(inner, 'Inner', 'I');
		const popOuter = registry.pushScope(outer);
		const popInner = registry.pushScope(inner);

		pressKey('O');
		pressKey('I');
		expect(onOuter).not.toHaveBeenCalled();
		expect(onInner).toHaveBeenCalledTimes(1);

		popInner();
		pressKey('O');
		expect(onOuter).toHaveBeenCalledTimes(1);
		expect(registry.getActiveScope()).toBe(outer);
		popOuter();
		expect(registry.getActiveScope()).toBeNull();
	});

});

describe('pushed scope edges', () => {
	it('ignores a scope that is not shown, e.g. a kept-mounted closed modal', () => {
		const onPage = addButtonIn(document.body, 'Page', 'P');
		registry.pushScope(addContainer({ 'data-test-hidden': '' }));

		pressKey('P');
		expect(onPage).toHaveBeenCalledTimes(1);
	});

	it('swallows a key owned behind the scope without running it', () => {
		const onBack = addButtonIn(document.body, 'Previous', 'ArrowLeft');
		registry.pushScope(addContainer());

		expect(press('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' })).toBe(true);
		expect(onBack).not.toHaveBeenCalled();
		expect(press('keydown', { key: 'ArrowRight', code: 'ArrowRight' })).toBe(false);
	});

	it('notifies subscribers on push and pop, so the overlay re-measures', () => {
		const listener = vi.fn();
		registry.subscribe(listener);
		const pop = registry.pushScope(addContainer());
		pop();
		expect(listener).toHaveBeenCalledTimes(2);
	});
});

describe('implicit dialog scope', () => {
	it('confines the keys to an open aria-modal dialog nobody pushed', () => {
		const onPage = addButtonIn(document.body, 'Page', 'P');
		const drawer = addContainer({ role: 'dialog', 'aria-modal': 'true' });
		const onClose = addButtonIn(drawer, 'Close', 'C');

		pressKey('P');
		pressKey('C');
		expect(onPage).not.toHaveBeenCalled();
		expect(onClose).toHaveBeenCalledTimes(1);

		drawer.remove();
		pressKey('P');
		expect(onPage).toHaveBeenCalledTimes(1);
	});

	it('leaves non-modal dialogs (popovers) and hidden modals alone', () => {
		const onPage = addButtonIn(document.body, 'Page', 'P');
		addContainer({ role: 'dialog' });
		addContainer({ role: 'dialog', 'aria-modal': 'true', 'data-test-hidden': '' });

		pressKey('P');
		expect(onPage).toHaveBeenCalledTimes(1);
	});

	it('lets a pushed scope inside a dialog narrow it further', () => {
		const dialog = addContainer({ role: 'dialog', 'aria-modal': 'true' });
		const onHeader = addButtonIn(dialog, 'Header', 'H');
		const panel = document.createElement('div');
		dialog.appendChild(panel);
		const onPanel = addButtonIn(panel, 'Panel', 'X');
		registry.pushScope(panel);

		pressKey('H');
		pressKey('X');
		expect(onHeader).not.toHaveBeenCalled();
		expect(onPanel).toHaveBeenCalledTimes(1);
	});
});
