import React from 'react';

import { componentAttrs, pageAttrs } from '../core/domAttributes';
import { formatIssues } from '../core/errors';

import type { StandardSchemaV1Issue } from '../core/standardSchema';


const errorStyle: React.CSSProperties = {
	color: 'var(--mantine-color-red-6, #e03131)',
	padding: '0.5rem',
	fontFamily: 'monospace',
	whiteSpace: 'pre-wrap',
};

/**
 * Diagnostics are plain DOM on purpose: this package must not depend on any
 * component library, so it cannot render a Mantine `Text` or `Alert`.
 */
export function UnknownTemplate({ templateId }: { templateId: string }): React.ReactNode {
	return <div style={errorStyle} {...pageAttrs(templateId)}>{`Unknown page template: ${templateId}`}</div>;
}

export function UnknownComponent({ type }: { type: string }): React.ReactNode {
	return <div style={errorStyle} {...componentAttrs(type)}>{`Unknown component renderer: ${type}`}</div>;
}

/**
 * `kind` decides which attribute names the failed contribution, so a page whose props are wrong is
 * still identifiable as a page rather than looking like a broken component.
 */
export function InvalidProps({ contributionId, issues, kind = 'component' }: {
	contributionId: string,
	issues: readonly StandardSchemaV1Issue[],
	kind?: 'component' | 'page',
}): React.ReactNode {
	const attrs = kind === 'page' ? pageAttrs(contributionId) : componentAttrs(contributionId);

	return (
		<div style={errorStyle} {...attrs}>
			{`Invalid props for "${contributionId}" -- ${formatIssues(issues)}`}
		</div>
	);
}
