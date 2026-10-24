import React from 'react';

import { useShortcut } from './useShortcut';

import type { ShortcutSpec } from './parseShortcut';
import type { ShortcutOptions } from './registry';


/** Digits are the only keys a sequence can number with, so it never goes past 9. */
const MAX_SEQUENCE_LENGTH = 9;

type SequenceMember = {
	element: HTMLElement,
	assign(spec: ShortcutSpec | undefined): void,
};

export type ShortcutSequenceScope = {
	/** Adds a member and renumbers. Returns the function that removes it again. */
	join(element: HTMLElement, assign: (spec: ShortcutSpec | undefined) => void): () => void,
};

export type ShortcutSequenceProps = {
	/** Modifiers put before the number, e.g. `'Shift+'` for `Alt+Shift+1`. Defaults to none. */
	prefix?: string,
	/** How many members get a number, in DOM order; the rest get none. Capped at 9. */
	max?: number,
	children?: React.ReactNode,
};

export type SequenceShortcutOptions = ShortcutOptions & {
	/** Stay out of the sequence, e.g. because the control has an explicit shortcut. */
	skip?: boolean,
};

const ShortcutSequenceContext = React.createContext<ShortcutSequenceScope | null>(null);


function compareDomOrder(left: SequenceMember, right: SequenceMember): number {
	const position = left.element.compareDocumentPosition(right.element);
	if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
		return -1;
	}
	return position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
}

const closestPortal = (element: Element) => element.closest('[data-portal]');

/**
 * Creates a scope numbering its members `{prefix}1` … `{prefix}{max}` in document order.
 *
 * `getAnchor` is an element placed where the sequence renders. React context reaches through
 * portals, so without it a button in a modal opened from the bar (a contextual action's prompt)
 * would join the bar's numbering. A control in a different Mantine portal than the anchor stays out.
 */
export function createShortcutSequenceScope(
	prefix: string, max: number, getAnchor?: () => Element | null,
): ShortcutSequenceScope {
	const members = new Set<SequenceMember>();
	const limit = Math.max(0, Math.min(max, MAX_SEQUENCE_LENGTH));

	function renumber(): void {
		[...members].sort(compareDomOrder).forEach((member, index) => {
			member.assign(index < limit ? `${prefix}${index + 1}` : undefined);
		});
	}

	return {
		join: (element, assign) => {
			const anchor = getAnchor?.();
			if (anchor && closestPortal(anchor) !== closestPortal(element)) {
				return () => undefined;
			}
			const member: SequenceMember = { element, assign };
			members.add(member);
			renumber();
			return () => {
				members.delete(member);
				renumber();
			};
		},
	};
}

/**
 * Numbers the controls inside it, in the order they appear. Sequences do not nest: an inner one
 * takes over its subtree, and its controls are numbered only by it.
 */
export function ShortcutSequence({ prefix = '', max = MAX_SEQUENCE_LENGTH, children }: ShortcutSequenceProps) {
	const anchorRef = React.useRef<HTMLSpanElement>(null);
	const scope = React.useMemo(() => createShortcutSequenceScope(prefix, max, () => anchorRef.current), [prefix, max]);
	return (
		<ShortcutSequenceContext.Provider value={scope}>
			{/* `hidden` is display:none: no box, and no gap in a flex parent. */}
			<span ref={anchorRef} hidden data-shortcut-sequence-anchor />
			{children}
		</ShortcutSequenceContext.Provider>
	);
}

/** The enclosing sequence, or `null`. Lets a control tell whether it would be numbered. */
export function useShortcutSequence(): ShortcutSequenceScope | null {
	return React.useContext(ShortcutSequenceContext);
}

/**
 * Joins the enclosing sequence and registers the number it assigns. Returns that spec, or
 * `undefined` outside a sequence, past its `max`, or with `skip`.
 */
export function useSequenceShortcut(
	ref: React.RefObject<HTMLElement | null>,
	options: SequenceShortcutOptions = {},
): ShortcutSpec | undefined {
	const { skip = false, ...shortcutOptions } = options;
	const scope = useShortcutSequence();
	const [spec, setSpec] = React.useState<ShortcutSpec | undefined>(undefined);

	React.useEffect(() => {
		const element = ref.current;
		if (!scope || skip || !element) {
			return undefined;
		}
		const leave = scope.join(element, setSpec);
		return () => {
			leave();
			setSpec(undefined);
		};
	}, [ref, scope, skip]);

	useShortcut(ref, spec, shortcutOptions);
	return spec;
}

/**
 * The one hook a control wrapper needs: an explicit `shortcut` wins, otherwise the control is
 * numbered by the enclosing sequence, if any. Returns the effective spec, for `aria-keyshortcuts`.
 */
export function useControlShortcut(
	ref: React.RefObject<HTMLElement | null>,
	shortcut: ShortcutSpec | undefined,
	options: ShortcutOptions = {},
): ShortcutSpec | undefined {
	useShortcut(ref, shortcut, options);
	const sequenceSpec = useSequenceShortcut(ref, { ...options, skip: shortcut !== undefined });
	return shortcut ?? sequenceSpec;
}
