import React from 'react';

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
	return <div style={errorStyle}>{`Unknown page template: ${templateId}`}</div>;
}

export function UnknownComponent({ type }: { type: string }): React.ReactNode {
	return <div style={errorStyle}>{`Unknown component renderer: ${type}`}</div>;
}

export function InvalidProps({ contributionId, issues }: {
	contributionId: string,
	issues: readonly StandardSchemaV1Issue[],
}): React.ReactNode {
	return <div style={errorStyle}>{`Invalid props for "${contributionId}" -- ${formatIssues(issues)}`}</div>;
}
