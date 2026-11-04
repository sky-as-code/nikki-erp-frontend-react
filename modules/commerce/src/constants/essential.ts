// Proxy copy of `nikkierp/modules/essential/src/constants/index.ts`; keep in step. Commerce registers nothing for these schemas:
// the essential micro-app stays in the host and is lazy-loaded to serve them.

export const ESSENTIAL_MODULE = 'essential';

// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend .../modules/essential/domain/models/{uom,uomcat,language}.go.
export const UOM_SCHEMA_NAME = 'essential_uom';
export const UOMCAT_SCHEMA_NAME = 'essential_uomcat';
export const LANGUAGE_SCHEMA_NAME = 'essential_language';
export const CURRENCY_SCHEMA_NAME = 'essential_currency';
export const SEQUENCE_DEFINITION_SCHEMA_NAME = 'essential_sequence_definition';
export const SEQUENCE_COUNTER_SCHEMA_NAME = 'essential_sequence_counter';
export const SEQUENCE_ISSUANCE_SCHEMA_NAME = 'essential_sequence_issuance';

/**
 * The dynamic resource engine serves a resource at `/v1/{module}/{schema_name}`, so the path
 * segment is the schema name itself rather than a pluralized noun.
 */
export const UOM_RESOURCE_PATH = `v1/essential/${UOM_SCHEMA_NAME}`;
export const UOMCAT_RESOURCE_PATH = `v1/essential/${UOMCAT_SCHEMA_NAME}`;
export const LANGUAGE_RESOURCE_PATH = `v1/essential/${LANGUAGE_SCHEMA_NAME}`;
export const CURRENCY_RESOURCE_PATH = `v1/essential/${CURRENCY_SCHEMA_NAME}`;
export const SEQUENCE_DEFINITION_RESOURCE_PATH = `v1/essential/${SEQUENCE_DEFINITION_SCHEMA_NAME}`;
export const SEQUENCE_COUNTER_RESOURCE_PATH = `v1/essential/${SEQUENCE_COUNTER_SCHEMA_NAME}`;
export const SEQUENCE_ISSUANCE_RESOURCE_PATH = `v1/essential/${SEQUENCE_ISSUANCE_SCHEMA_NAME}`;

/** The currency pages' route segment; Settings mounts them under `essential/`, where Settings › Accounting links. */
export const CURRENCY_ROUTE = CURRENCY_SCHEMA_NAME;

/**
 * The routes of the three Sequence pages, relative to the micro-app that mounts them. Settings mounts them under
 * `essential/` (Settings › Technical › Sequences) and passes its own; the pages link to each other through these.
 */
export type SequenceRoutes = { definition: string, counter: string, issuance: string };

export const SEQUENCE_ROUTES: SequenceRoutes = Object.freeze({
	definition: SEQUENCE_DEFINITION_SCHEMA_NAME,
	counter: SEQUENCE_COUNTER_SCHEMA_NAME,
	issuance: SEQUENCE_ISSUANCE_SCHEMA_NAME,
});

/** The hardcoded timezone catalogue (`GET ?keyword=&language_code=`); not a dynamic resource. */
export const TIMEZONES_PATH = 'v1/essential/timezones';
