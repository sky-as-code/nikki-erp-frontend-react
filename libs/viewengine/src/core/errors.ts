import type { StandardSchemaV1Issue } from './standardSchema';


/**
 * Thrown when a contribution id is registered twice without `override: true`.
 * Registration happens during a micro-app's `init()`, i.e. before mount, so the
 * Shell surfaces this in its micro-app error panel instead of the UI silently
 * rendering the wrong template.
 */
export class ViewEngineConflictError extends Error {
	public readonly kind: string;
	public readonly key: string;
	public readonly currentOwner?: string;

	constructor(kind: string, key: string, currentOwner?: string) {
		super(
			`${kind} "${key}" is already registered${currentOwner ? ` by "${currentOwner}"` : ''}.`
			+ ' Pass { override: true } to replace it deliberately.',
		);
		this.name = 'ViewEngineConflictError';
		this.kind = kind;
		this.key = key;
		this.currentOwner = currentOwner;
	}
}

/** Thrown when a non-`nikkierp` kit tries to create (not override) a reserved id. */
export class ReservedVendorError extends Error {
	constructor(kitId: string, contributionId: string) {
		super(
			`Kit "${kitId}" may not create the reserved id "${contributionId}".`
			+ ' Reserved ids can only be overridden, never introduced, by a third-party kit.',
		);
		this.name = 'ReservedVendorError';
	}
}

/** Raised (as a value, not thrown) when a node's props fail their template schema. */
export class PropsValidationError extends Error {
	public readonly contributionId: string;
	public readonly issues: readonly StandardSchemaV1Issue[];

	constructor(contributionId: string, issues: readonly StandardSchemaV1Issue[]) {
		super(`Invalid props for "${contributionId}": ${formatIssues(issues)}`);
		this.name = 'PropsValidationError';
		this.contributionId = contributionId;
		this.issues = issues;
	}
}

export function formatIssues(issues: readonly StandardSchemaV1Issue[]): string {
	return issues.map(issue => `${formatPath(issue.path)}${issue.message}`).join('; ');
}

function formatPath(path: StandardSchemaV1Issue['path']): string {
	if (!path || path.length === 0) {
		return '';
	}
	const segments = path.map(segment => String(
		typeof segment === 'object' && segment !== null && 'key' in segment ? segment.key : segment,
	));
	return `${segments.join('.')}: `;
}
