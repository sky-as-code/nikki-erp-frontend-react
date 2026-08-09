import { joinTestId } from '@nikkierp/common/utils';


/**
 * Derives the `{module}.{component}` test-id prefix for a view-engine page part.
 *
 * Page metadata carries no test ids: everything needed is already there. The module comes from the
 * route the page is mounted at and the component from the schema it renders, so `users` +
 * `iam_user` + a list becomes `users.userList` — stable across runs, and distinct from the same
 * schema's detail page on the same route.
 *
 * A page author who needs something else passes `testId` explicitly; that always wins.
 */
export function resourceTestIdPrefix(args: {
	testId?: string,
	routePath?: string,
	schemaName: string,
	part: ResourcePart,
}): string | undefined {
	if (args.testId) {
		return args.testId;
	}
	const moduleSegment = moduleSegmentOf(args.routePath);
	return joinTestId(moduleSegment, `${entityOf(args.schemaName)}${args.part}`);
}

export type ResourcePart = 'List' | 'Detail' | 'Create' | 'Table' | 'SplitView';

/** First segment of the route, which is the page's own slug (`users`, `roles/:id` -> `roles`). */
function moduleSegmentOf(routePath: string | undefined): string | undefined {
	return routePath?.split('/').filter(Boolean)[0];
}

/**
 * `iam_user` -> `user`. A dynamic-model schema name is `{module}_{entity}` in snake_case, and the
 * module part is already implied by the route, so only the entity is worth repeating here.
 */
function entityOf(schemaName: string): string {
	const parts = schemaName.split('_').filter(Boolean);
	const entityParts = parts.length > 1 ? parts.slice(1) : parts;
	return entityParts
		.map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
		.join('');
}
