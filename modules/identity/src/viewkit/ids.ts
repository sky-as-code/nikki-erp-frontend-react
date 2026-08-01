/**
 * Contribution ids owned by the identity module's own view kit.
 *
 * Format is `{vendor}.{kit}.{kind}.{name}.v{major}`, same as the Mantine kit. The vendor is
 * `nikkierp` and so is the kit id, which is what the engine's vendor policy checks: a kit may
 * freely create ids under its own vendor, and only a *foreign* vendor is blocked from minting
 * `nikkierp.*` ids. A breaking props change ships as a new `.v2` id, never as a mutation.
 *
 * These live here rather than in `viewkit-mantine` because they are IAM-specific: a role
 * assignment wizard is not a general-purpose page template.
 */
export const IDENTITY_VIEW_KIT_ID = 'nikkierp.identity';

export const ROLE_ASSIGNMENT_TEMPLATE = 'nikkierp.identity.pages.templates.roleAssignment.v1';

/*
 * The wizard's own pieces. They are registered rather than composed as JSX because a page — and
 * a page template — must not import a custom component directly: everything visual resolves
 * through the registry, so it can be placed, reordered or overridden without editing React.
 *
 * The parts of the wizard proper carry the `roleAssignment.` parent path; the three that are
 * useful on their own (a picker, a delta summary, an entitlement list) do not.
 */
export const ROLE_ASSIGNMENT_ACTIONS = 'nikkierp.identity.components.roleAssignment.actions.v1';
export const ROLE_ASSIGNMENT_ERROR = 'nikkierp.identity.components.roleAssignment.error.v1';
export const ROLE_ASSIGNMENT_ACKNOWLEDGE = 'nikkierp.identity.components.roleAssignment.acknowledge.v1';
export const ASSIGNMENT_CHANGE_SUMMARY = 'nikkierp.identity.components.assignmentChangeSummary.v1';
export const ROLE_PICKER = 'nikkierp.identity.components.rolePicker.v1';
export const ENTITLEMENT_CHANGE_LIST = 'nikkierp.identity.components.entitlementChangeList.v1';
