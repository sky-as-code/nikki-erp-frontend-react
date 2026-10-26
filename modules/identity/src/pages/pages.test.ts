import { isOrgScoped, withOrgId } from '@nikkierp/common/service';
import { findUngatedActions } from '@nikkierp/viewkit-mantine/actionCodes';
import { RESOURCE_DETAIL_V2_TEMPLATE, RESOURCE_LIST_V2_TEMPLATE } from '@nikkierp/viewkit-mantine/ids';
import { describe, expect, it } from 'vitest';

import { buildGroupPages } from './group';
import { buildOrganizationPages } from './organization';
import { buildRolePages } from './role';
import { buildRoleAssignmentPages } from './roleAssignment';
import { buildUserPages } from './user';
import { ROLE_PERMISSIONS } from '../viewkit/ids';

import type { SchemaPack } from '@nikkierp/common/dynamicModel';
import type { PageNode } from '@nikkierp/viewengine/metadata';
import type { RelatedResource } from '@nikkierp/viewkit-mantine/props';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'user', build: buildUserPages },
	{ name: 'group', build: buildGroupPages },
	{ name: 'organization', build: buildOrganizationPages },
	{ name: 'role', build: buildRolePages },
	{ name: 'roleAssignment', build: buildRoleAssignmentPages },
];

describe('IAM page metadata', () => {
	/**
	 * Every action resolves to the code the backend asserts, or the button is not locked for a user
	 * the server refuses. A custom verb needs an explicit `actionCode` from the application service.
	 */
	it.each(allPages)('$name pages declare no ungated action', ({ build }) => {
		expect(findUngatedActions(build())).toEqual([]);
	});

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

	it.each(allPages.filter(({ name }) => name !== 'roleAssignment'))(
		'$name pages nest a v2 list and a v2 detail in a split view',
		({ build }) => {
			const [page] = build();
			const props = page.props as { primary: { template: string }, secondary: { template: string } };

			expect(page.template).toContain('resourceSplitView');
			expect(props.primary.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
			expect(props.secondary.template).toBe(RESOURCE_DETAIL_V2_TEMPLATE);
		},
	);

	it('keeps field renderers as serializable specs, not resolved renderers', () => {
		const [page] = buildUserPages();
		const props = page.props as { primary: { props: { fieldRenderers: Record<string, unknown> } } };

		expect(props.primary.props.fieldRenderers).toEqual({
			avatar_url: { renderer: 'avatar', fileIdField: 'avatar_file_id' },
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
		expect(routePaths).toEqual(['iam_user/:id/roles', 'iam_group/:id/roles']);
	});

	// The same many-to-many edge read from the role side, with the assignment wizard reached from
	// the related tab's own action bar. `linked` is the membership operator for a many edge;
	// `${id}` is interpolated from the route at render time.
	it.each([
		{ name: 'user', build: buildUserPages, label: 'user_sections_assignedRoles', edge: 'assigned_users', principal: 'iam_user' },
		{ name: 'group', build: buildGroupPages, label: 'group_sections_assignedRoles', edge: 'assigned_groups', principal: 'iam_group' },
	])('$name detail page lists assigned roles as a related resource', ({ build, label, edge, principal }) => {
		const [page] = build();
		const detail = (page.props as { secondary: { props: { relatedResources: RelatedResource[] } } }).secondary;
		const [assignedRoles] = detail.props.relatedResources;

		expect(detail.props.relatedResources).toHaveLength(1);
		expect(assignedRoles.label).toBe(label);
		// Gated on the principal, at tenant scope: that is what the backend asserts on the save the
		// wizard ends in, and it passes no org.
		expect(assignedRoles.extraActions).toEqual([{
			label: 'assignment.manageRoles', routePath: 'roles',
			actionCode: 'manage_role_assignments', actionResource: principal, actionScope: 'tenant',
		}]);
		expect(assignedRoles.initialGraph).toEqual({ if: [edge, 'linked', '${id}'] });
	});
});

describe('IAM role page metadata', () => {
	it('role list leaves boolean columns to the built-in Switch renderer', () => {
		const [page] = buildRolePages();
		const props = page.props as { primary: { props: { fieldRenderers?: Record<string, unknown> } } };

		expect(props.primary.props.fieldRenderers ?? {}).not.toHaveProperty('is_private');
	});

	// Written from the role side, but gated like the principal pages: the backend asserts
	// `manage_role_assignments` on the principal with no org, which only a tenant grant satisfies.
	it.each([
		{ tab: 0, principal: 'iam_user', command: 'iam.iam_role.manage_role_users', prompt: 'role_assign_newUser' },
		{ tab: 1, principal: 'iam_group', command: 'iam.iam_role.manage_role_groups', prompt: 'role_assign_newGroup' },
	])('role detail tab $tab assigns $principal through $command', ({ tab, principal, command, prompt }) => {
		const [page] = buildRolePages();
		type Detail = { relatedResources: RelatedResource[], relatedResourcesNotice?: string };
		const detail = (page.props as { secondary: { props: Detail } }).secondary.props;

		expect(detail.relatedResourcesNotice).toBe('role_relatedNotice');
		expect(detail.relatedResources[tab].assignment).toMatchObject({
			pickerSchemaName: principal, manageCommand: command, newRowPrompt: prompt,
			btnDeleteLabel: 'common:action.unassign',
			actionCode: 'manage_role_assignments', actionResource: principal, actionScope: 'tenant',
		});
	});

	it('role detail tabs request their own columns, not the schema defaults', () => {
		const [page] = buildRolePages();
		type Detail = { relatedResources: RelatedResource[] };
		const [users, groups] = (page.props as { secondary: { props: Detail } }).secondary.props.relatedResources;

		expect(users.fields).toEqual(['avatar_url', 'display_name', 'email']);
		expect(users.fieldRenderers).toEqual({ avatar_url: { renderer: 'avatar', fileIdField: 'avatar_file_id' } });
		expect(groups.fields).toEqual(['name']);
	});

	// `iam_role` opts out of org scoping, so nothing seeds `org_id` and no input sends one: a role
	// created here is tenant-wide (NULL org).
	it('role create and detail forms carry no org_id field', () => {
		const [page] = buildRolePages();
		type Detail = { createNodes: unknown[], childrenNodes: unknown[] };
		const detail = (page.props as { secondary: { props: Detail } }).secondary.props;

		expect(collectFormFields(detail.createNodes)).toEqual(expect.arrayContaining(['name', 'description']));
		expect(collectFormFields(detail.createNodes)).not.toContain('org_id');
		expect(collectFormFields(detail.childrenNodes)).not.toContain('org_id');
		expect(JSON.stringify(detail.createNodes)).not.toContain(ROLE_PERMISSIONS);
		expect(JSON.stringify(detail.childrenNodes)).toContain(ROLE_PERMISSIONS);
	});

	it('role is not org-scoped, so create sends no org_id even though the schema has the column', async () => {
		const schema = { modelSchema: { name: 'iam_role', fields: { org_id: {} } } } as unknown as SchemaPack;

		expect(isOrgScoped(schema, 'iam_role')).toBe(false);
		expect(await withOrgId({ name: 'Auditor' }, schema, 'iam_role')).toEqual({ name: 'Auditor' });
	});
});

/** Every `fields` list in a node tree, flattened. */
function collectFormFields(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.flatMap(collectFormFields);
	}
	if (value === null || typeof value !== 'object') {
		return [];
	}
	return Object.entries(value).flatMap(([key, item]) => (
		key === 'fields' && Array.isArray(item) ? item as string[] : collectFormFields(item)
	));
}

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
