import { COLLAPSIBLE_SECTION } from '../../ids';
import { resourceStatusStripNode } from '../../props';

import type { StatusPlacement } from './resourceUpdateContext';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The page's sections with the status strip placed for `firstSection`: the first child of the first
 * section when that is a `collapsible_section` (a full row of its `formBlocks` grid), else a node of
 * its own before the sections. Unchanged for `toolbar`, or when the page declares no statuses.
 */
export function withStatusStrip(
	nodes: ComponentNode[], placement: StatusPlacement | undefined, hasStatuses: boolean,
): ComponentNode[] {
	if (placement !== 'firstSection' || !hasStatuses) {
		return nodes;
	}
	const strip = resourceStatusStripNode();
	const [first, ...rest] = nodes;
	if (first?.component !== COLLAPSIBLE_SECTION) {
		return [strip, ...nodes];
	}
	return [{ ...first, children: [strip, ...(first.children ?? [])] }, ...rest];
}
