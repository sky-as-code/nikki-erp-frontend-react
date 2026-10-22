import { Button, Group } from '@mantine/core';
import { TranslateFn } from '@nikkierp/ui/i18n';
import { MenuItem } from '@nikkierp/ui/menu';
import { IconChevronDown, IconDots } from '@tabler/icons-react';
import React from 'react';

import classes from './MenuBar.module.css';


/**
 * How many leading items fit in `available` pixels. When some do not, the overflow trigger takes
 * its own slot, so the count is recomputed with that width reserved.
 */
export function fitMenuItems(
	itemWidths: number[],
	overflowWidth: number,
	gap: number,
	available: number,
): number {
	if (fitCount(itemWidths, gap, available) === itemWidths.length) {
		return itemWidths.length;
	}
	return fitCount(itemWidths, gap, available - overflowWidth - gap);
}

function fitCount(widths: number[], gap: number, available: number): number {
	let used = 0;
	for (let i = 0; i < widths.length; i++) {
		used += widths[i] + (i > 0 ? gap : 0);
		if (used > available) {
			return i;
		}
	}
	return widths.length;
}

export type MenuOverflow = {
	containerRef: React.RefObject<HTMLDivElement | null>,
	measureRef: React.RefObject<HTMLDivElement | null>,
	visibleCount: number,
};

/**
 * Measures the hidden row and the space the bar is given, and recomputes whenever either changes
 * size — a resize, a late web font, or a locale switch that changes label widths.
 */
export function useMenuOverflow(itemCount: number): MenuOverflow {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const measureRef = React.useRef<HTMLDivElement>(null);
	const [visibleCount, setVisibleCount] = React.useState(itemCount);

	React.useLayoutEffect(() => {
		const container = containerRef.current;
		const measurer = measureRef.current;
		if (!container || !measurer) {
			return undefined;
		}
		const recompute = () => setVisibleCount(measureVisibleCount(container, measurer, itemCount));
		recompute();
		const observer = new ResizeObserver(recompute);
		observer.observe(container);
		observer.observe(measurer);
		return () => observer.disconnect();
	}, [itemCount]);

	return { containerRef, measureRef, visibleCount };
}

function measureVisibleCount(container: HTMLElement, measurer: HTMLElement, itemCount: number): number {
	const children = Array.from(measurer.children) as HTMLElement[];
	if (children.length !== itemCount + 1) {
		return itemCount;
	}
	const widths = children.map(child => child.getBoundingClientRect().width);
	const overflowWidth = widths.pop() ?? 0;
	const gap = parseFloat(getComputedStyle(measurer).columnGap) || 0;
	return fitMenuItems(widths, overflowWidth, gap, container.clientWidth);
}

/**
 * An invisible copy of the top-level entries, always fully laid out, so every entry has a width
 * to measure even while it sits in the overflow menu. It carries no test ids and no links, so it
 * never answers a test selector or a keyboard user.
 */
export function MenuMeasureRow({ items, buttonProps, t, measureRef }: {
	items: MenuItem[],
	buttonProps: React.ComponentProps<typeof Button>,
	t: TranslateFn,
	measureRef: React.RefObject<HTMLDivElement | null>,
}): React.ReactNode {
	return (
		<Group ref={measureRef} gap='xs' wrap='nowrap' className={classes.measureRow} aria-hidden inert>
			{items.map(item => (
				<Button
					key={item.labelKey}
					{...buttonProps}
					tabIndex={-1}
					rightSection={item.items ? <IconChevronDown size={14} /> : undefined}
				>
					{t(item.labelKey)}
				</Button>
			))}
			<Button {...buttonProps} tabIndex={-1} rightSection={<IconChevronDown size={14} />}>
				<IconDots size={16} />
			</Button>
		</Group>
	);
}
