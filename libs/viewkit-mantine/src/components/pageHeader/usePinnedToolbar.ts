import React from 'react';


/**
 * Every ancestor box that can scroll above `node`, nearest first.
 *
 * The page's scroll box is not a fixed part of this kit's markup — the Shell owns it, a page
 * embedded in a split pane scrolls in a different one again, and the view engine adds
 * `position: absolute` frames of its own in between. So the chain is discovered rather than
 * assumed, and *all* of it is returned rather than just the first hit.
 *
 * Returning the whole chain is what makes the pin reliable. Picking a single scroller forces two
 * guesses that are both wrong here: testing `overflow-y` alone stops at an inner absolute frame
 * that carries `auto` but never actually scrolls, while adding a `scrollHeight > clientHeight`
 * test rejects the real scroller for being momentarily short — this hook resolves the chain while
 * the record is still loading and the sections below have not rendered yet — and falls through to
 * the viewport, which then never fires a scroll event at all. Listening to every candidate and
 * re-measuring geometry each time sidesteps the guess entirely.
 */
function findScrollAncestors(node: HTMLElement | null): HTMLElement[] {
	const found: HTMLElement[] = [];
	let current = node?.parentElement ?? null;
	while (current) {
		const overflowY = getComputedStyle(current).overflowY;
		if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
			found.push(current);
		}
		current = current.parentElement;
	}
	return found;
}

/**
 * The box the pinned row should align to: the nearest ancestor that actually clips its content.
 *
 * A frame that carries `overflow-y: auto` but whose content fits exactly (`scrollHeight` equal to
 * `clientHeight`) is not the box the row scrolls within — its top edge tracks the content and
 * would place the pinned row off-screen. The first genuinely-clipping box is the honest boundary,
 * and it is resolved on every measure because which box clips changes as content loads in.
 */
function findClippingBox(candidates: HTMLElement[]): HTMLElement | null {
	return candidates.find(el => el.scrollHeight > el.clientHeight) ?? null;
}

type PinMeasurement = {
	isPinned: boolean,
	placeholderHeight: number,
	geometry: { top: number, left: number, width: number },
};

/**
 * Reads the live layout and decides whether the row should be pinned, and where.
 *
 * The sentinel stays in flow whether or not the row is pinned, so it is the honest reference for
 * "has the header scrolled past?" — reading the row's own box once it is `fixed` would compare it
 * against itself and latch.
 */
function measurePin(row: HTMLElement, sentinel: HTMLElement, scrollers: HTMLElement[]): PinMeasurement {
	// Resolved per measure, not once: which ancestor clips depends on how much content has loaded,
	// and the row must align to whichever box is clipping right now.
	const clipper = findClippingBox(scrollers);
	const boundaryTop = clipper ? clipper.getBoundingClientRect().top : 0;
	const isPinned = sentinel.getBoundingClientRect().bottom <= boundaryTop;
	const box = clipper?.getBoundingClientRect();

	return {
		isPinned,
		placeholderHeight: row.offsetHeight,
		geometry: box
			? { top: box.top, left: box.left, width: box.width }
			: { top: 0, left: 0, width: window.innerWidth },
	};
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

		const scrollers = findScrollAncestors(row);

		const measure = (): void => {
			const next = measurePin(row, sentinel, scrollers);
			setIsPinned(next.isPinned);
			setPlaceholderHeight(next.placeholderHeight);
			setGeometry(next.geometry);
		};

		measure();
		// Every candidate is listened to, not just the one clipping at setup time — the box that
		// scrolls can change as the page fills in, and a listener on the wrong one is silent.
		scrollers.forEach(el => el.addEventListener('scroll', measure, { passive: true }));
		window.addEventListener('scroll', measure, { passive: true });
		window.addEventListener('resize', measure);
		// Content above the toolbar can change height without any scroll — a section collapsing, a
		// record loading in — which moves the boundary the pin decision is made against.
		const observer = new ResizeObserver(measure);
		observer.observe(sentinel);
		observer.observe(row);
		scrollers.forEach(el => observer.observe(el));

		return () => {
			scrollers.forEach(el => el.removeEventListener('scroll', measure));
			window.removeEventListener('scroll', measure);
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
