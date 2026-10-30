import { Stack } from '@mantine/core';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import React from 'react';

import type { MantineSpacing } from '@mantine/core';


/**
 * The space between a page's last block and the window bottom. A list page's table body ends on the
 * same token (`ExcelDataTableBody.module.css`), so both templates leave the same gap.
 */
export const PAGE_BOTTOM_GAP = 'var(--nikki-page-bottom-gap, var(--mantine-spacing-md))';

/**
 * The page shell every full-width page renders into.
 *
 * Absolutely positioned against the shell's content area rather than laid out in flow: the
 * micro-app root has no height of its own, so a page that scrolls has to own the viewport box
 * itself or its content escapes the frame.
 *
 * `inset-0`, not the `top-0 left-0 right-0 bottom-0` longhands: this build emits no rule for
 * `bottom-0`, so the box was pinned at the top only and grew to its content -- which left
 * `overflow-auto` with nothing to scroll and clipped long pages at the fold.
 *
 * A React component rather than a registered contribution — it is layout with no configuration,
 * and it belongs to the template's React seam alongside the page's providers and
 * `MetaComponent`, not to the metadata a page author writes.
 *
 * `gap` defaults to `md`, which the dashboard-style pages rely on. A page whose blocks carry their
 * own bottom margin (the resource detail sections) passes 0, so its last block keeps that margin
 * above the window bottom instead of sitting flush against it.
 */
export function PageContainer(
	{ children, gap = 'md' }: { children: React.ReactNode, gap?: MantineSpacing | number },
): React.ReactNode {
	const bgColor = usePaperBgColor();

	return (
		<Stack
			bg={bgColor}
			className='absolute inset-0 p-0 m-0 px-4 flex overflow-auto'
			style={{ paddingBottom: PAGE_BOTTOM_GAP }}
			gap={gap}
		>
			{children}
		</Stack>
	);
}
