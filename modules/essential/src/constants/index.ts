export const ESSENTIAL_MODULE = 'essential';

// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend .../modules/essential/domain/models/{uom,uomcat}.go.
export const UOM_SCHEMA_NAME = 'essential_uom';
export const UOMCAT_SCHEMA_NAME = 'essential_uomcat';

/**
 * The dynamic resource engine serves a resource at `/v1/{module}/{schema_name}`, so the path
 * segment is the schema name itself rather than a pluralized noun.
 */
export const UOM_RESOURCE_PATH = `v1/essential/${UOM_SCHEMA_NAME}`;
export const UOMCAT_RESOURCE_PATH = `v1/essential/${UOMCAT_SCHEMA_NAME}`;
