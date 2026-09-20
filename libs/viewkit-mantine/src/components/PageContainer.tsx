import { Stack } from '@mantine/core';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import React from 'react';


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
 */
export function PageContainer({ children }: { children: React.ReactNode }): React.ReactNode {
	const bgColor = usePaperBgColor();

	return (
		<Stack
			bg={bgColor}
			className='absolute inset-0 p-0 m-0 px-4 pb-4 flex overflow-auto'
			gap='md'
		>
			{children}
		</Stack>
	);
}
