export const IAM_MODULE = 'iam';

export const GROUP_SCHEMA_NAME = 'iam_group';
export const USER_SCHEMA_NAME = 'iam_user';
// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend .../modules/iam/domain/models/{org,orgunit}.go.
export const ORGANIZATION_SCHEMA_NAME = 'iam_org';
export const ORG_UNIT_SCHEMA_NAME = 'iam_orgunit';
export const ROLE_SCHEMA_NAME = 'iam_role';