export const IAM_MODULE = 'iam';

export const GROUP_SCHEMA_NAME = 'iam_group';
export const USER_SCHEMA_NAME = 'iam_user';
/** Machine principals: the backend's own resource over the users table (no email, no photo, no sign-in). */
export const SERVICE_SCHEMA_NAME = 'iam_service';
// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend .../modules/iam/domain/models/{org,orgunit}.go.
export const ORGANIZATION_SCHEMA_NAME = 'iam_org';
export const ORG_UNIT_SCHEMA_NAME = 'iam_orgunit';
export const ROLE_SCHEMA_NAME = 'iam_role';
export const ENTITLEMENT_SCHEMA_NAME = 'iam_entitlement';
export const RESOURCE_SCHEMA_NAME = 'iam_resource';
export const ACTION_SCHEMA_NAME = 'iam_action';

/** The Shell's `USER_ORGS_CHANGED_EVENT`: the Org Switch refetches its list on it. */
export const SHELL_USER_ORGS_CHANGED_EVENT = 'shell:user_orgs:changed';
