import React from 'react';

import { componentAttrs, pageAttrs } from '../core/domAttributes';

import type { ContributionId } from '../core/ids';


/**
 * `display: contents` makes the carrier itself invisible to layout: its children participate in
 * the parent's flex or grid box exactly as if the wrapper were not there. Without it, dropping a
 * `<div>` into a Mantine `Stack` or a CSS grid would reflow the page.
 */
const carrierStyle: React.CSSProperties = { display: 'contents' };

/**
 * Carries `data-component` for a renderer that has no root DOM element of its own — one rooted in
 * a context provider, or one that returns a different element per branch (loading, empty, error).
 *
 * A renderer whose root *is* a DOM element should spread {@link componentAttrs} onto that element
 * instead and skip the extra node.
 */
export function ComponentAnchor({ id, children }: {
	id: ContributionId,
	children: React.ReactNode,
}): React.ReactNode {
	return <div style={carrierStyle} {...componentAttrs(id)}>{children}</div>;
}

/** {@link ComponentAnchor} for page templates: carries `data-page`. */
export function PageAnchor({ id, children }: {
	id: ContributionId,
	children: React.ReactNode,
}): React.ReactNode {
	return <div style={carrierStyle} {...pageAttrs(id)}>{children}</div>;
}
