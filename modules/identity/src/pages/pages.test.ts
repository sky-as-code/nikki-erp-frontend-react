import { describe, expect, it } from 'vitest';

import { buildGroupPages } from './group';
import { buildOrganizationPages } from './organization';
import { buildRolePages } from './role';
import { buildRoleAssignmentPages } from './roleAssignment';
import { buildUserPages } from './user';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'user', build: buildUserPages },
	{ name: 'group', build: buildGroupPages },
	{ name: 'organization', build: buildOrganizationPages },
	{ name: 'role', build: buildRolePages },
	{ name: 'roleAssignment', build: buildRoleAssignmentPages },
];

describe('IAM page metadata', () => {
	/**
	 * The gate for the whole migration. Page props used to be class instances
	 * guarded by `instanceof`, which can never survive a bundle boundary. If this
	 * test fails, something non-serializable (a class, a function, a live object)
	 * has crept back into page metadata.
	 */
	it.each(allPages)('$name pages survive a JSON round-trip unchanged', ({ build }) => {
		const pages = build();

		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it.each(allPages)('$name pages carry no functions or class instances', ({ build }) => {
		expect(findNonPlainValue(build(), '$')).toBeNull();
	});

	it('nests both split-view panes as template refs', () => {
		const [page] = buildUserPages();
		const props = page.props as { primary: { template: string }, secondary: { template: string } };

		expect(page.template).toContain('resourceSplitView');
		expect(props.primary.template).toContain('resourceList');
		expect(props.secondary.template).toContain('resourceDetails');
	});

	it('keeps field renderers as serializable specs, not resolved renderers', () => {
		const [page] = buildUserPages();
		const props = page.props as { primary: { props: { fieldRenderers: Record<string, unknown> } } };

		expect(props.primary.props.fieldRenderers).toEqual({
			avatar_url: { renderer: 'avatar' },
			status: {
				renderer: 'badge',
				prefix: 'status.',
				colorMap: { invited: 'indigo', active: 'green', locked: 'orange', terminated: 'gray' },
			},
		});
	});

	it('keeps both assignment stages on one route, with no extra segment', () => {
		const routePaths = buildRoleAssignmentPages().map(page => page.routePath);

		// The stage lives in React state, so neither page contributes a `/:step` segment.
		expect(routePaths).toEqual(['users/:id/roles', 'groups/:id/roles']);
	});

	it.each([
		{ kind: 'user', build: buildUserPages, edge: 'assigned_users' },
		{ kind: 'group', build: buildGroupPages, edge: 'assigned_groups' },
	])('$kind detail page lists assigned roles through the $edge edge', ({ build, edge }) => {
		const [page] = build();
		const detail = (page.props as { secondary: { props: { childrenNodes: ComponentNode[] } } }).secondary;
		const panel = detail.props.childrenNodes
			.find(node => node.children?.some(child => child.props?.filterGraph != null));
		const [table] = panel?.children ?? [];

		expect(panel).toBeDefined();

		// The wizard is reached from the table's own action bar, next to Refresh — the panel
		// header carries no button.
		expect(panel?.props?.headerAction).toBeUndefined();
		expect(table.props?.extraActions).toEqual([{ label: 'assignment.manageRoles', routePath: 'roles' }]);
		// `linked` is the membership operator for a many edge; `${id}` is interpolated from
		// the route at render time.
		expect(table.props?.filterGraph).toEqual({ if: [edge, 'linked', '${id}'] });
	});
});

/** Returns the path of the first non-JSON-safe value, or null when the tree is clean. */
function findNonPlainValue(value: unknown, path: string): string | null {
	if (value === null || ['string', 'number', 'boolean', 'undefined'].includes(typeof value)) {
		return null;
	}
	if (typeof value !== 'object') {
		return path;
	}
	if (Array.isArray(value)) {
		return value.reduce<string | null>(
			(found, item, index) => found ?? findNonPlainValue(item, `${path}[${index}]`),
			null,
		);
	}
	if (Object.getPrototypeOf(value) !== Object.prototype) {
		return path;
	}
	return Object.entries(value).reduce<string | null>(
		(found, [key, item]) => found ?? findNonPlainValue(item, `${path}.${key}`),
		null,
	);
}
