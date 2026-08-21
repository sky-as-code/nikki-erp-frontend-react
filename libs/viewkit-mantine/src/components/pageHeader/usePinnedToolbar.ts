import React from 'react';


/**
 * Which element actually scrolls above `node`.
 *
 * The page's scroll box is not a fixed part of this kit's markup — the Shell owns it, and a page
 * embedded in a split pane scrolls in a different one again — so it is discovered rather than
 * assumed. Falls back to the viewport, which is what an unscrollable ancestor chain means.
 */
function findScrollParent(node: HTMLElement | null): HTMLElement | Window {
	let current = node?.parentElement ?? null;
	while (current) {
		const overflowY = getComputedStyle(current).overflowY;
		if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
			return current;
		}
		current = current.parentElement;
	}
	return window;
}

export type PinnedToolbarState = {
	/** Attach to the element that should pin. */
	rowRef: React.RefObject<HTMLDivElement | null>,
	/** Attach to the always-in-flow element the row sits after, so its height can be reserved. */
	sentinelRef: React.RefObject<HTMLDivElement | null>,
	isPinned: boolean,
	/** `top`/`left`/`width` for the pinned row, as CSS custom properties. */
	pinnedStyle: React.CSSProperties,
	/** Height to reserve in the flow while pinned. */
	placeholderHeight: number,
};

/**
 * Pins a toolbar to the top of its scroll container once the content above it scrolls out of view.
 *
 * Measures rather than hard-codes: the row's left edge and width are taken from the scroll
 * container's own box each time it changes, so the pinned row lines up with the content it belongs
 * to instead of spanning the whole window — which would run it under the Shell's sidebar.
 */
export function usePinnedToolbar(enabled: boolean): PinnedToolbarState {
	const rowRef = React.useRef<HTMLDivElement | null>(null);
	const sentinelRef = React.useRef<HTMLDivElement | null>(null);
	const [isPinned, setIsPinned] = React.useState(false);
	const [geometry, setGeometry] = React.useState({ top: 0, left: 0, width: 0 });
	const [placeholderHeight, setPlaceholderHeight] = React.useState(0);

	React.useEffect(() => {
		const row = rowRef.current;
		const sentinel = sentinelRef.current;
		if (!enabled || !row || !sentinel) {
			setIsPinned(false);
			return undefined;
		}

		const scroller = findScrollParent(row);
		const scrollerEl = scroller === window ? null : (scroller as HTMLElement);

		const measure = (): void => {
			// The sentinel stays in flow whether or not the row is pinned, so it is the honest
			// reference for "has the header scrolled past?" — reading the row's own box once it is
			// fixed would compare it against itself and latch.
			const boundaryTop = scrollerEl ? scrollerEl.getBoundingClientRect().top : 0;
			const sentinelBottom = sentinel.getBoundingClientRect().bottom;
			const shouldPin = sentinelBottom <= boundaryTop;

			setIsPinned(shouldPin);
			setPlaceholderHeight(row.offsetHeight);
			if (scrollerEl) {
				const box = scrollerEl.getBoundingClientRect();
				setGeometry({ top: box.top, left: box.left, width: box.width });
			}
			else {
				setGeometry({ top: 0, left: 0, width: window.innerWidth });
			}
		};

		measure();
		const target: HTMLElement | Window = scroller;
		target.addEventListener('scroll', measure, { passive: true });
		window.addEventListener('resize', measure);
		// Content above the toolbar can change height without any scroll — a section collapsing, a
		// record loading in — which moves the boundary the pin decision is made against.
		const observer = new ResizeObserver(measure);
		observer.observe(sentinel);
		observer.observe(row);
		if (scrollerEl) {
			observer.observe(scrollerEl);
		}

		return () => {
			target.removeEventListener('scroll', measure);
			window.removeEventListener('resize', measure);
			observer.disconnect();
		};
	}, [enabled]);

	const pinnedStyle = React.useMemo((): React.CSSProperties => ({
		'--nikki-page-toolbar-top': `${geometry.top}px`,
		'--nikki-page-toolbar-left': `${geometry.left}px`,
		'--nikki-page-toolbar-width': `${geometry.width}px`,
	} as React.CSSProperties), [geometry]);

	return { rowRef, sentinelRef, isPinned, pinnedStyle, placeholderHeight };
}
