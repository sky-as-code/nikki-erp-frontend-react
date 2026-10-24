/**
 * A shortcut spec: up to two of `Ctrl+` and `Shift+`, then one key, e.g. `'O'`, `'/'`, `'Shift+1'`,
 * `'Shift+ArrowRight'`, `'Ctrl+Shift+K'`. Alt is implicit — every shortcut is Alt-held.
 */
export type ShortcutSpec = string;

export type ParsedShortcut = {
	ctrl: boolean,
	shift: boolean,
	/** `KeyboardEvent.code` to match. Never `key`: macOS Option and Shift both rewrite `key`. */
	code: string,
	/** The key alone, as the keycap shows it. */
	keyLabel: string,
	/** The key alone, in `aria-keyshortcuts` syntax. */
	ariaKey: string,
};

type KeyInfo = { code: string, label: string, aria: string };

const NAMED_KEYS: Record<string, KeyInfo> = {
	'/': { code: 'Slash', label: '/', aria: '/' },
	ArrowLeft: { code: 'ArrowLeft', label: '←', aria: 'ArrowLeft' },
	ArrowRight: { code: 'ArrowRight', label: '→', aria: 'ArrowRight' },
	ArrowUp: { code: 'ArrowUp', label: '↑', aria: 'ArrowUp' },
	ArrowDown: { code: 'ArrowDown', label: '↓', aria: 'ArrowDown' },
	Enter: { code: 'Enter', label: '↵', aria: 'Enter' },
	Escape: { code: 'Escape', label: 'Esc', aria: 'Escape' },
};

const MODIFIERS = new Set(['Ctrl', 'Shift']);
const cache = new Map<string, ParsedShortcut | null>();


function resolveKey(token: string): KeyInfo | null {
	if (/^[a-z]$/i.test(token)) {
		const upper = token.toUpperCase();
		return { code: `Key${upper}`, label: upper, aria: upper };
	}
	if (/^\d$/.test(token)) {
		return { code: `Digit${token}`, label: token, aria: token };
	}
	return NAMED_KEYS[token] ?? null;
}

function parseUncached(spec: ShortcutSpec): ParsedShortcut | string {
	const tokens = spec.split('+');
	const keyToken = tokens.pop() ?? '';
	const modifiers = new Set<string>();
	for (const token of tokens) {
		if (!MODIFIERS.has(token) || modifiers.has(token)) {
			return `unsupported or repeated modifier '${token}' (allowed: Ctrl+, Shift+; Alt is implicit)`;
		}
		modifiers.add(token);
	}
	const key = resolveKey(keyToken);
	if (!key) {
		return `unsupported key '${keyToken}'`;
	}
	return {
		ctrl: modifiers.has('Ctrl'),
		shift: modifiers.has('Shift'),
		code: key.code,
		keyLabel: key.label,
		ariaKey: key.aria,
	};
}

/**
 * Parses a spec. An invalid spec throws in dev, so the mistake surfaces at the call site, and is
 * ignored (`null`) in production rather than breaking the page.
 */
export function parseShortcut(spec: ShortcutSpec): ParsedShortcut | null {
	if (cache.has(spec)) {
		return cache.get(spec) ?? null;
	}
	const result = parseUncached(spec);
	if (typeof result === 'string') {
		if (import.meta.env.DEV) {
			throw new Error(`Invalid shortcut '${spec}': ${result}`);
		}
		cache.set(spec, null);
		return null;
	}
	cache.set(spec, result);
	return result;
}

export function matchesShortcut(parsed: ParsedShortcut, event: KeyboardEvent): boolean {
	return event.altKey
		&& !event.metaKey
		&& event.ctrlKey === parsed.ctrl
		&& event.shiftKey === parsed.shift
		&& event.code === parsed.code;
}

/** Keycap text: `⇧1`, `Ctrl+⇧K`, `/`, `←`. Alt is left out — it is the key being held. */
export function formatShortcutLabel(parsed: ParsedShortcut): string {
	return `${parsed.ctrl ? 'Ctrl+' : ''}${parsed.shift ? '⇧' : ''}${parsed.keyLabel}`;
}

/** The value for a control's `aria-keyshortcuts`, e.g. `Alt+Shift+1`. */
export function toAriaKeyShortcuts(spec: ShortcutSpec | undefined): string | undefined {
	const parsed = spec ? parseShortcut(spec) : null;
	if (!parsed) {
		return undefined;
	}
	return ['Alt', parsed.ctrl && 'Control', parsed.shift && 'Shift', parsed.ariaKey].filter(Boolean).join('+');
}
