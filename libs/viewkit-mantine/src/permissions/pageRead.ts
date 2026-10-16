import { ResourceScope } from '@nikkierp/common/entitlements';

import type { EntitlementRequirement } from '@nikkierp/common/entitlements';
import type { PageNode } from '@nikkierp/viewengine/metadata';


/**
 * What a page needs before any of it renders: `read` on every resource its template is bound to.
 *
 * Only the template props are consulted -- the page's own `schemaName`, and for a split view the
 * two panes' -- not the related tables nested inside. A related table the user may not read is
 * one empty section, not a reason to refuse the page.
 */
export function pageReadRequirements(page: PageNode): EntitlementRequirement[] {
	const schemas = new Set<string>();
	const props = page.props as Record<string, unknown> | undefined;
	collectSchemaName(props, schemas);
	collectSchemaName(templateProps(props?.primary), schemas);
	collectSchemaName(templateProps(props?.secondary), schemas);
	return [...schemas].map(resource => ({ action: 'read', resource, scope: ResourceScope.Org }));
}

function templateProps(ref: unknown): Record<string, unknown> | undefined {
	if (ref == null || typeof ref !== 'object') {
		return undefined;
	}
	const props = (ref as { props?: unknown }).props;
	return props != null && typeof props === 'object' ? props as Record<string, unknown> : undefined;
}

function collectSchemaName(props: Record<string, unknown> | undefined, into: Set<string>): void {
	if (typeof props?.schemaName === 'string' && props.schemaName.length > 0) {
		into.add(props.schemaName);
	}
}
