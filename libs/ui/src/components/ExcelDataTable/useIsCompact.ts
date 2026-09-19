import { useMediaQuery } from '@mantine/hooks';
import React from 'react';


/**
 * The width under which the table switches to its mobile behaviours: actions folded into one menu,
 * the filter panel as a modal, Prev/Next-only pagination, a view-mode dropdown.
 *
 * Same breakpoint as `RelationPickerModal`; Mantine's `sm`.
 */
export const COMPACT_MEDIA_QUERY = '(max-width: 48em)';
export const COMPACT_WIDTH_PX = 768;

/**
 * Publishes the toolbar's measured width, so the compact switch follows the space the table
 * actually has rather than the size of the screen.
 *
 * The viewport is the wrong question in a split view: the list pane can be a fifth of a wide
 * screen, which is narrower than any phone, while `(max-width: 48em)` stays false. The Provider is
 * allowed to sit at page level with no element of its own, so the measurement is taken by the
 * Toolbar — which does own one — and read back through context.
 */
export function useContainerWidthState(): {
	width: number | null,
	setWidth: (width: number | null) => void,
} {
	const [width, setWidth] = React.useState<number | null>(null);
	// Last reading wins. A composition may hold more than one Toolbar — pagination above and below
	// is a documented layout — but they sit in the same column and report the same width, so there
	// is nothing to reconcile between them; taking the maximum instead would leave a toolbar that
	// had shrunk reporting the width it used to have.
	return React.useMemo(() => ({ width, setWidth }), [width]);
}

/**
 * Observes an element's width and reports it upward. Returns the ref to attach.
 *
 * `ResizeObserver` rather than a media query because the element's width changes without the
 * viewport's — dragging the split-view splitter is the whole case this exists for.
 */
export function useMeasuredWidth(onWidth: (width: number | null) => void): React.RefCallback<HTMLElement> {
	const observerRef = React.useRef<ResizeObserver | null>(null);
	// The callback is read through a ref so that the returned ref callback can have an empty
	// dependency list. React detaches a ref callback whose identity changed — calling it with
	// `null` first — and `onWidth` comes from the context value, which is rebuilt on every state
	// change. Depending on it directly made each measurement immediately undo itself.
	const onWidthRef = React.useRef(onWidth);
	onWidthRef.current = onWidth;

	return React.useCallback((element: HTMLElement | null) => {
		observerRef.current?.disconnect();
		observerRef.current = null;
		if (!element) {
			return;
		}
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				onWidthRef.current(entry.contentRect.width);
			}
		});
		observer.observe(element);
		observerRef.current = observer;
		onWidthRef.current(element.getBoundingClientRect().width);
	}, []);
}

/**
 * Whether the table should use its compact behaviours.
 *
 * Prefers the container's own measured width; falls back to the viewport until the first
 * measurement lands, so the very first render is not wrong on a phone.
 */
export function useIsCompact(containerWidth: number | null): boolean {
	const isNarrowViewport = useMediaQuery(COMPACT_MEDIA_QUERY, false, { getInitialValueInEffect: false }) ?? false;
	return containerWidth === null ? isNarrowViewport : containerWidth < COMPACT_WIDTH_PX;
}
