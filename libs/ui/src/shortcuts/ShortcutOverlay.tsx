import React from 'react';
import { createPortal } from 'react-dom';

import { formatShortcutLabel } from './parseShortcut';
import { getShortcutRegistry, isShortcutTargetDisabled } from './registry';
import classes from './ShortcutOverlay.module.css';

import type { ShortcutRegistry } from './registry';


type Badge = {
	id: number,
	label: string,
	disabled: boolean,
	rect: DOMRect,
};

export type ShortcutOverlayProps = {
	/** Defaults to the app-wide registry. */
	registry?: ShortcutRegistry,
};


function measureBadges(registry: ShortcutRegistry): Badge[] {
	return registry.getActiveEntries().map(entry => ({
		id: entry.id,
		label: formatShortcutLabel(entry.parsed),
		disabled: isShortcutTargetDisabled(entry),
		rect: entry.element.getBoundingClientRect(),
	}));
}

/** Re-renders on scroll (any scroller, hence capture) and resize, at most once a frame, while `active`. */
function useLayoutTick(active: boolean): void {
	const [, setTick] = React.useState(0);
	React.useEffect(() => {
		if (!active) {
			return undefined;
		}
		let frame = 0;
		const schedule = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => setTick(value => value + 1));
		};
		window.addEventListener('scroll', schedule, { capture: true, passive: true });
		window.addEventListener('resize', schedule);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule, { capture: true });
			window.removeEventListener('resize', schedule);
		};
	}, [active]);
}

function BadgeView({ badge }: { badge: Badge }) {
	const { top, left, width, height } = badge.rect;
	return (
		<div className={classes.cover} style={{ top, left, width, height }} data-disabled={badge.disabled || undefined}>
			<span className={classes.keycap}>{badge.label}</span>
		</div>
	);
}

/**
 * Draws a keycap over every shown control with a shortcut while Alt is held. Mount it once, near
 * the root; it renders nothing until Alt goes down.
 */
export function ShortcutOverlay({ registry: given }: ShortcutOverlayProps) {
	const registry = given ?? getShortcutRegistry();
	const snapshot = React.useSyncExternalStore(registry.subscribe, registry.getSnapshot);
	useLayoutTick(snapshot.visible);
	// Measured on every render: each one is caused by a registration, a scroll or a resize.
	const badges = snapshot.visible ? measureBadges(registry) : [];

	if (badges.length === 0) {
		return null;
	}
	return createPortal(
		<div className={classes.layer} aria-hidden='true'>
			{badges.map(badge => <BadgeView key={badge.id} badge={badge} />)}
		</div>,
		document.body,
	);
}
