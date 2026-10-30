import { usePaperBgColor } from '@nikkierp/ui/theme';
import clsx from 'clsx';
import React from 'react';

import classes from './PageHeader.module.css';
import { usePinnedBlock } from './usePinnedBlock';


export type PinnedBlockProps = {
	children: React.ReactNode,
	/** `false` leaves the block in the flow, scrolling with the page. */
	enabled?: boolean,
};

/**
 * A page's whole header — titles, subtitle and actions row — kept in sight while the page scrolls.
 *
 * Three boxes: the slot stays in the flow and reserves the content's height once the band leaves it;
 * the band is what pins (`position: fixed`, opaque, measured geometry); the content stacks the
 * header's rows. The page header and the create form's header both render through it, so the two
 * pin alike.
 */
export function PinnedBlock({ children, enabled = true }: PinnedBlockProps): React.ReactNode {
	const pin = usePinnedBlock(enabled);
	const bg = usePaperBgColor();

	return (
		<div
			ref={pin.slotRef}
			className={classes.pinSlot}
			style={pin.isPinned ? { height: pin.placeholderHeight } : undefined}
		>
			<div
				className={clsx({ [classes.pinned]: pin.isPinned })}
				style={{ backgroundColor: bg, ...(pin.isPinned ? pin.pinnedStyle : {}) }}
			>
				<div ref={pin.contentRef} className={classes.pinContent}>{children}</div>
			</div>
		</div>
	);
}
