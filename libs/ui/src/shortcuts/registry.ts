import { matchesShortcut, parseShortcut } from './parseShortcut';

import type { ParsedShortcut, ShortcutSpec } from './parseShortcut';


export type ShortcutMode = 'click' | 'focus';

export type ShortcutOptions = {
	/** `click` (default) focuses then clicks — buttons, links, menu items. `focus` only focuses — inputs. */
	mode?: ShortcutMode,
	disabled?: boolean,
};

export type ShortcutEntry = {
	readonly id: number,
	readonly element: HTMLElement,
	readonly spec: ShortcutSpec,
	readonly parsed: ParsedShortcut,
	mode: ShortcutMode,
	disabled: boolean,
};

export type ShortcutHandle = {
	update(options: ShortcutOptions): void,
	unregister(): void,
};

export type ShortcutRegistrySnapshot = {
	/** Alt is held: badges are showing. */
	readonly visible: boolean,
	/** Bumped on every registration change, so subscribers re-measure. */
	readonly version: number,
};

export type ShortcutRegistry = {
	register(element: HTMLElement, spec: ShortcutSpec, options?: ShortcutOptions): ShortcutHandle | null,
	subscribe(listener: () => void): () => void,
	getSnapshot(): ShortcutRegistrySnapshot,
	/** The shown entries in the active scope, one per spec: the latest registered wins a conflict. */
	getActiveEntries(): ShortcutEntry[],
	/**
	 * Confines shortcuts to the controls inside `root` while it is shown — a modal's content. Returns
	 * the function that removes it again. See {@link ShortcutRegistry.getActiveScope}.
	 */
	pushScope(root: Element): () => void,
	/**
	 * The element shortcuts are confined to, or `null` when all of the page is live: the last, in
	 * document order, of the shown pushed scopes and the shown `aria-modal` dialogs.
	 */
	getActiveScope(): Element | null,
	/** Removes the window listeners. Only tests need it; the app keeps the singleton for its lifetime. */
	dispose(): void,
};

export const SHORTCUTS_VISIBLE_ATTRIBUTE = 'data-nikki-shortcuts-visible';

const REGISTRY_KEY = Symbol.for('nikki.shortcuts');

/**
 * Every Mantine `Modal`, `Drawer` and `@mantine/modals` dialog renders its content with these, so
 * one that was never given an explicit scope still confines the keys.
 */
const IMPLICIT_SCOPE_SELECTOR = '[role="dialog"][aria-modal="true"]';


/** Whether a registered element is on screen, so its badge can be drawn and its key can fire. */
export function isShortcutTargetShown(element: HTMLElement): boolean {
	if (!element.isConnected || element.closest('[aria-hidden="true"], [inert]')) {
		return false;
	}
	const style = getComputedStyle(element);
	// offsetParent is also null for a position:fixed element, which is shown.
	if ((element.offsetParent === null && style.position !== 'fixed') || style.visibility === 'hidden') {
		return false;
	}
	const rect = element.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0;
}

export function isShortcutTargetDisabled(entry: ShortcutEntry): boolean {
	const element = entry.element;
	return entry.disabled
		|| element.matches(':disabled')
		|| element.getAttribute('aria-disabled') === 'true';
}

function isScopeShown(root: Element): boolean {
	return root instanceof HTMLElement && isShortcutTargetShown(root);
}

/**
 * Modals share one z-index and one portal node, so the one painted on top, and the one the user
 * is looking at, is the last in document order. A scope inside another counts as following it.
 */
function lastInDocumentOrder(roots: Element[]): Element | null {
	return roots.reduce<Element | null>((last, root) => {
		const follows = last && last.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING;
		return !last || follows ? root : last;
	}, null);
}

function pickWinners(
	entries: Iterable<ShortcutEntry>, scope: Element | null, onConflict?: (spec: string) => void,
): ShortcutEntry[] {
	const winners = new Map<string, ShortcutEntry>();
	for (const entry of entries) {
		if ((scope && !scope.contains(entry.element)) || !isShortcutTargetShown(entry.element)) {
			continue;
		}
		const key = `${entry.parsed.ctrl}|${entry.parsed.shift}|${entry.parsed.code}`;
		const current = winners.get(key);
		if (current) {
			onConflict?.(entry.spec);
		}
		if (!current || current.id < entry.id) {
			winners.set(key, entry);
		}
	}
	return [...winners.values()];
}

function runEntry(entry: ShortcutEntry): void {
	entry.element.focus();
	if (entry.mode === 'click') {
		entry.element.click();
	}
}

function warnConflict(spec: string): void {
	if (import.meta.env.DEV) {
		console.warn(`[shortcuts] Several visible controls use Alt+${spec}; the latest registered one wins.`);
	}
}

function isAltKey(event: KeyboardEvent): boolean {
	return event.key === 'Alt' || event.code === 'AltLeft' || event.code === 'AltRight';
}

class WindowShortcutRegistry implements ShortcutRegistry {
	private readonly entries = new Map<number, ShortcutEntry>();
	private readonly scopes: Element[] = [];
	private readonly listeners = new Set<() => void>();
	private snapshot: ShortcutRegistrySnapshot = { visible: false, version: 0 };
	private nextId = 1;
	private installed = false;
	/** Alt went down and a shortcut ran, or badges were drawn, before it came back up. */
	private altConsumed = false;

	private readonly target: Window;

	constructor(target: Window) {
		this.target = target;
	}

	register(element: HTMLElement, spec: ShortcutSpec, options: ShortcutOptions = {}): ShortcutHandle | null {
		const parsed = parseShortcut(spec);
		if (!parsed) {
			return null;
		}
		this.install();
		const id = this.nextId++;
		const entry: ShortcutEntry = {
			id, element, spec, parsed, mode: options.mode ?? 'click', disabled: !!options.disabled,
		};
		this.entries.set(id, entry);
		this.emit(this.snapshot.visible, true);
		return {
			update: next => {
				entry.mode = next.mode ?? entry.mode;
				entry.disabled = next.disabled ?? entry.disabled;
				this.emit(this.snapshot.visible, true);
			},
			unregister: () => {
				if (this.entries.delete(id)) {
					this.emit(this.snapshot.visible, true);
				}
			},
		};
	}

	subscribe = (listener: () => void): (() => void) => {
		this.install();
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	getSnapshot = (): ShortcutRegistrySnapshot => this.snapshot;

	getActiveEntries(): ShortcutEntry[] {
		return pickWinners(this.entries.values(), this.getActiveScope());
	}

	pushScope(root: Element): () => void {
		this.scopes.push(root);
		this.emit(this.snapshot.visible, true);
		let pushed = true;
		return () => {
			const index = this.scopes.lastIndexOf(root);
			if (pushed && index >= 0) {
				this.scopes.splice(index, 1);
				this.emit(this.snapshot.visible, true);
			}
			pushed = false;
		};
	}

	getActiveScope(): Element | null {
		const dialogs = this.target.document.querySelectorAll(IMPLICIT_SCOPE_SELECTOR);
		return lastInDocumentOrder([...this.scopes, ...dialogs].filter(isScopeShown));
	}

	dispose(): void {
		this.target.removeEventListener('keydown', this.onKeyDown, true);
		this.target.removeEventListener('keyup', this.onKeyUp, true);
		this.target.removeEventListener('blur', this.hide);
		this.target.document.removeEventListener('visibilitychange', this.onVisibilityChange);
		this.installed = false;
		this.hide();
	}

	private install(): void {
		if (this.installed) {
			return;
		}
		this.installed = true;
		this.target.addEventListener('keydown', this.onKeyDown, true);
		this.target.addEventListener('keyup', this.onKeyUp, true);
		this.target.addEventListener('blur', this.hide);
		this.target.document.addEventListener('visibilitychange', this.onVisibilityChange);
	}

	private emit(visible: boolean, bumpVersion: boolean): void {
		const previous = this.snapshot;
		if (previous.visible === visible && !bumpVersion) {
			return;
		}
		this.snapshot = { visible, version: previous.version + (bumpVersion ? 1 : 0) };
		this.target.document.documentElement.toggleAttribute(SHORTCUTS_VISIBLE_ATTRIBUTE, visible);
		this.listeners.forEach(listener => listener());
	}

	private hide = (): void => {
		this.altConsumed = false;
		this.emit(false, false);
	};

	private onKeyDown = (event: KeyboardEvent): void => {
		if (isAltKey(event)) {
			this.altConsumed = this.altConsumed || this.entries.size > 0;
			this.emit(true, false);
			return;
		}
		if (!event.altKey) {
			this.hide();
			return;
		}
		this.handleShortcutKey(event);
	};

	private handleShortcutKey(event: KeyboardEvent): void {
		const candidates = [...this.entries.values()].filter(entry => matchesShortcut(entry.parsed, event));
		const scope = this.getActiveScope();
		const winner = pickWinners(candidates, scope, warnConflict)[0];
		if (!winner) {
			// Owned behind the open modal: swallowed like a disabled match, so Alt+← is not Back there.
			if (scope && pickWinners(candidates, null).length > 0) {
				event.preventDefault();
			}
			return;
		}
		// A disabled match still swallows the key: Alt+← on page 1 must not trigger the browser's Back.
		event.preventDefault();
		this.altConsumed = true;
		if (!event.repeat && !isShortcutTargetDisabled(winner)) {
			runEntry(winner);
		}
	}

	private onKeyUp = (event: KeyboardEvent): void => {
		if (!isAltKey(event)) {
			return;
		}
		// Reduces, without removing, Firefox-on-Windows opening its menu bar on a bare Alt release.
		if (this.altConsumed) {
			event.preventDefault();
		}
		this.hide();
	};

	private onVisibilityChange = (): void => {
		if (this.target.document.visibilityState === 'hidden') {
			this.hide();
		}
	};
}

/** Creates a registry listening on `target`. The app uses {@link getShortcutRegistry}; tests create their own. */
export function createShortcutRegistry(target: Window = window): ShortcutRegistry {
	return new WindowShortcutRegistry(target);
}

/**
 * The app-wide registry. Kept on `globalThis` so that two bundled copies of `@nikkierp/ui` (one per
 * micro-app) still share one listener and one set of badges.
 */
export function getShortcutRegistry(): ShortcutRegistry {
	const holder = globalThis as unknown as Record<symbol, ShortcutRegistry | undefined>;
	holder[REGISTRY_KEY] ??= createShortcutRegistry();
	return holder[REGISTRY_KEY];
}
