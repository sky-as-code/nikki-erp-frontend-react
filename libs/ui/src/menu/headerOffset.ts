import React from 'react';


/**
 * The Shell header's bottom edge in viewport px, published on `<html>`. A pinned ribbon makes the
 * header taller, so anything pinned under it (a page toolbar) reads this rather than assuming 50px.
 */
export const HEADER_BOTTOM_CSS_VAR = '--nikki-header-bottom';

/** Fired on `window` whenever the published header bottom changes, so a pinned element re-measures. */
export const HEADER_RESIZE_EVENT = 'nikki:header-resize';

/** The published header bottom, or 0 outside the Shell (a standalone module host has no header). */
export function readHeaderBottom(): number {
	const value = getComputedStyle(document.documentElement).getPropertyValue(HEADER_BOTTOM_CSS_VAR);
	const px = Number.parseFloat(value);
	return Number.isFinite(px) ? px : 0;
}

/** Keeps `HEADER_BOTTOM_CSS_VAR` in step with `header`'s box, for the Shell's one header. */
export function usePublishHeaderBottom(header: HTMLElement | null): void {
	React.useEffect(() => {
		if (!header) {
			return undefined;
		}
		const publish = (): void => {
			const bottom = Math.round(header.getBoundingClientRect().bottom);
			document.documentElement.style.setProperty(HEADER_BOTTOM_CSS_VAR, `${bottom}px`);
			window.dispatchEvent(new Event(HEADER_RESIZE_EVENT));
		};
		publish();
		const observer = new ResizeObserver(publish);
		observer.observe(header);
		return () => {
			observer.disconnect();
			document.documentElement.style.removeProperty(HEADER_BOTTOM_CSS_VAR);
		};
	}, [header]);
}
