import { useDynamicModel } from '@nikkierp/ui/hookhoc';
import { useSchemaLocalize } from '@nikkierp/ui/i18n';

import type { BreadcrumbsRootParent } from '@nikkierp/ui/breadcrumbs';


/** The record a nested page hangs under: its link (path-relative to the page) and its schema. */
export type ParentResourceSpec = {
	/** Path-relative to the page that shows the crumb; `'../'` from a nested list, `'../../'` from its record. */
	parentLink: string,
	/** The parent's schema name; the crumb shows that schema's label. */
	parentResource: string,
};

/** The crumb of a page's owning record, labelled by the parent schema's own name; `undefined` without a spec. */
export function useParentResourceCrumb(spec: ParentResourceSpec | undefined): BreadcrumbsRootParent | undefined {
	const { pack } = useDynamicModel(spec?.parentResource ?? '');
	const localize = useSchemaLocalize(spec?.parentResource ?? '');
	if (!spec) {
		return undefined;
	}
	const label = pack?.modelSchema?.label ? localize(pack.modelSchema.label) : undefined;
	return { to: spec.parentLink, label: label || undefined };
}

/** The spec of a page's `parentLink` / `parentResource` props, when both are given. */
export function parentResourceSpecOf(
	props: { parentLink?: string, parentResource?: string },
): ParentResourceSpec | undefined {
	return props.parentLink && props.parentResource
		? { parentLink: props.parentLink, parentResource: props.parentResource }
		: undefined;
}
