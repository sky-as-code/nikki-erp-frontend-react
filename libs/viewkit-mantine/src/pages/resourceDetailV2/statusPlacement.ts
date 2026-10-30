import { COLLAPSIBLE_SECTION } from '../../ids';
import { resourceStatusStripNode } from '../../props';

import type { StatusPlacement } from './resourceUpdateContext';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The page's sections with the status strip placed:
 * - `firstSection`: the first child of the first section when that is a `collapsible_section` (a
 *   full row of its `formBlocks` grid);
 * - `firstSectionHeader`: that section's header `rightSegment`, inline beside its title.
 *
 * With no `collapsible_section` first, both fall back to a node of its own before the sections.
 * Unchanged for `toolbar`, or when the page declares no statuses.
 */
export function withStatusStrip(
	nodes: ComponentNode[], placement: StatusPlacement | undefined, hasStatuses: boolean,
): ComponentNode[] {
	if ((placement !== 'firstSection' && placement !== 'firstSectionHeader') || !hasStatuses) {
		return nodes;
	}
	const [first, ...rest] = nodes;
	if (first?.component !== COLLAPSIBLE_SECTION) {
		return [resourceStatusStripNode(), ...nodes];
	}
	if (placement === 'firstSectionHeader') {
		const rightSegment = resourceStatusStripNode({ inline: true });
		return [{ ...first, props: { ...first.props, rightSegment } }, ...rest];
	}
	return [{ ...first, children: [resourceStatusStripNode(), ...(first.children ?? [])] }, ...rest];
}
