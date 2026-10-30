import { HEADER_RESIZE_EVENT, readHeaderBottom } from '@nikkierp/ui/menu';
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

/** Sub-pixel layout rounding must not pin a block that is resting exactly at the boundary. */
const PIN_TOLERANCE_PX = 0.5;

/**
 * Reads the live layout and decides whether the block should be pinned, and where.
 *
 * The slot stays in flow whether or not the block is pinned, so its top edge is the honest reference
 * for "has the page scrolled past the header?" — reading the pinned block's own box would compare it
 * against itself and latch. The reserved height is the content's, not the band's: the pinned band adds
 * padding of its own, and reserving that too would push the page down at the moment it pins.
 */
function measurePin(slot: HTMLElement, content: HTMLElement, scrollers: HTMLElement[]): PinMeasurement {
	// Resolved per measure, not once: which ancestor clips depends on how much content has loaded,
	// and the block must align to whichever box is clipping right now.
	const clipper = findClippingBox(scrollers);
	const box = clipper?.getBoundingClientRect();
	// Never above the Shell header: with no clipping box yet (the record still loading) the viewport
	// top would put the block over a pinned ribbon, and a ribbon that just grew moves the box late.
	const boundaryTop = Math.max(box?.top ?? 0, readHeaderBottom());
	const isPinned = slot.getBoundingClientRect().top < boundaryTop - PIN_TOLERANCE_PX;

	return {
		isPinned,
		placeholderHeight: content.offsetHeight,
		// clientWidth, not the box width: the band must stop at the scroller's scrollbar, otherwise its
		// right-aligned actions jump sideways the moment it pins.
		geometry: clipper && box
			? { top: boundaryTop, left: box.left + clipper.clientLeft, width: clipper.clientWidth }
			: { top: boundaryTop, left: 0, width: window.innerWidth },
	};
}

export type PinnedBlockState = {
	/** Attach to the always-in-flow box the block sits in; it reserves the block's height while pinned. */
	slotRef: React.RefObject<HTMLDivElement | null>,
	/** Attach to the block's content, whose height is what the slot reserves. */
	contentRef: React.RefObject<HTMLDivElement | null>,
	isPinned: boolean,
	/** `top`/`left`/`width` for the pinned block, as CSS custom properties. */
	pinnedStyle: React.CSSProperties,
	/** Height to reserve in the flow while pinned. */
	placeholderHeight: number,
};

/**
 * Pins a block to the top of its scroll container as soon as the page scrolls past its top edge.
 *
 * Measures rather than hard-codes: the block's left edge and width are taken from the scroll
 * container's own box each time it changes, so the pinned block lines up with the content it belongs
 * to instead of spanning the whole window — which would run it under the Shell's sidebar.
 */
export function usePinnedBlock(enabled: boolean): PinnedBlockState {
	const slotRef = React.useRef<HTMLDivElement | null>(null);
	const contentRef = React.useRef<HTMLDivElement | null>(null);
	const [isPinned, setIsPinned] = React.useState(false);
	const [geometry, setGeometry] = React.useState({ top: 0, left: 0, width: 0 });
	const [placeholderHeight, setPlaceholderHeight] = React.useState(0);

	React.useEffect(() => {
		const slot = slotRef.current;
		const content = contentRef.current;
		if (!enabled || !slot || !content) {
			setIsPinned(false);
			return undefined;
		}

		const scrollers = findScrollAncestors(slot);
		const measure = (): void => {
			const next = measurePin(slot, content, scrollers);
			setIsPinned(next.isPinned);
			setPlaceholderHeight(next.placeholderHeight);
			setGeometry(next.geometry);
		};
		return subscribeLayout(measure, [slot, content], scrollers);
	}, [enabled]);

	const pinnedStyle = React.useMemo((): React.CSSProperties => ({
		'--nikki-page-toolbar-top': `${geometry.top}px`,
		'--nikki-page-toolbar-left': `${geometry.left}px`,
		'--nikki-page-toolbar-width': `${geometry.width}px`,
	} as React.CSSProperties), [geometry]);

	return { slotRef, contentRef, isPinned, pinnedStyle, placeholderHeight };
}

/** Runs `measure` now and on every layout change that can move the pin boundary; returns the cleanup. */
function subscribeLayout(measure: () => void, observed: HTMLElement[], scrollers: HTMLElement[]): () => void {
	measure();
	// Every candidate is listened to, not just the one clipping at setup time — the box that
	// scrolls can change as the page fills in, and a listener on the wrong one is silent.
	scrollers.forEach(el => el.addEventListener('scroll', measure, { passive: true }));
	window.addEventListener('scroll', measure, { passive: true });
	window.addEventListener('resize', measure);
	// The Shell header grows when the ribbon is pinned or switches tab, without any scroll.
	window.addEventListener(HEADER_RESIZE_EVENT, measure);
	// Content can change height without any scroll — a subtitle loading in, a section collapsing —
	// which changes the height the slot must reserve.
	const observer = new ResizeObserver(measure);
	observed.forEach(el => observer.observe(el));
	scrollers.forEach(el => observer.observe(el));

	return () => {
		scrollers.forEach(el => el.removeEventListener('scroll', measure));
		window.removeEventListener('scroll', measure);
		window.removeEventListener('resize', measure);
		window.removeEventListener(HEADER_RESIZE_EVENT, measure);
		observer.disconnect();
	};
}
