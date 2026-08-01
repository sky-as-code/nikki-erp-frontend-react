import { defineTemplateRef } from '@nikkierp/viewengine/metadata';
import { z } from 'zod';

import { ROLE_ASSIGNMENT_TEMPLATE } from './ids';

import type { TemplateRef } from '@nikkierp/viewengine/metadata';


/**
 * Authoring surface for the identity kit. Deliberately React-free, like
 * `@nikkierp/viewkit-mantine/props`: a page definition is plain JSON that must survive a bundle
 * boundary, so it may not pull components in. The builder parses eagerly so a bad page fails
 * where it is authored rather than at render time.
 */
export const roleAssignmentPropsSchema = z.object({
	/** Schema of the principal receiving roles — `iam_user` or `iam_group`. */
	principalSchemaName: z.string().min(1),
	/** Field on the principal used in the page title. */
	principalDisplayField: z.string().min(1),
	translationNs: z.string().min(1),
	/** i18n key for the title; receives the principal's display value as `{{name}}`. */
	titleKey: z.string().min(1),

	/** Reads the principal, for the title. */
	getPrincipalCommand: z.string().min(1),
	/** Lists the roles already assigned to the principal, to seed the selection. */
	assignedRolesCommand: z.string().min(1),
	/** Searches all roles, for the picker. */
	roleSearchCommand: z.string().min(1),
	/** Resolves the selected roles into readable entitlements for stage 2. */
	describeCommand: z.string().min(1),
	/** Applies the `{ add, remove }` delta. */
	saveCommand: z.string().min(1),
	/**
	 * Where Back and a successful Save navigate to, resolved **path**-relative to the current URL:
	 * `'..'` means one URL segment up. Navigation passes `{ relative: 'path' }` for that reason.
	 */
	backRoutePath: z.string().min(1).default('..'),
}).strict();

export type RoleAssignmentProps = z.infer<typeof roleAssignmentPropsSchema>;
export type RoleAssignmentPropsInput = z.input<typeof roleAssignmentPropsSchema>;

export function roleAssignmentProps(input: RoleAssignmentPropsInput): TemplateRef<RoleAssignmentProps> {
	return defineTemplateRef(ROLE_ASSIGNMENT_TEMPLATE, roleAssignmentPropsSchema.parse(input));
}

export * from './ids';
