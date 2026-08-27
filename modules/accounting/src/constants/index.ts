export const ACCOUNTING_MODULE = 'accounting';

// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever rather than failing visibly. See
// backend-coremart26-mono/nikkierp/modules/accounting/domain/models/*.go.
//
// Note `accounting_tax`, NOT `accounting_tax_tax`: the module prefix and the entity name coincide
// on the root resource, so the schema name carries it only once. Note also
// `accounting_tax_group`, not the requirement's shorthand `accounting_taxgroup` — the engine
// derives the IAM resource code from the schema name, and a code that drifts denies every request
// with nothing pointing at the cause.
export const TAX_SCHEMA_NAME = 'accounting_tax';
export const TAX_JURISDICTION_SCHEMA_NAME = 'accounting_tax_jurisdiction';
export const TAX_GROUP_SCHEMA_NAME = 'accounting_tax_group';
export const TAX_ROUNDING_POLICY_SCHEMA_NAME = 'accounting_tax_rounding_policy';
export const TAX_PRODUCT_CLASSIFICATION_SCHEMA_NAME = 'accounting_tax_product_classification';
export const TAX_DEFINITION_VERSION_SCHEMA_NAME = 'accounting_tax_definition_version';
export const TAX_RATE_VERSION_SCHEMA_NAME = 'accounting_tax_rate_version';
export const TAX_COMPONENT_SCHEMA_NAME = 'accounting_tax_component';
export const TAX_MAPPING_SCHEMA_NAME = 'accounting_tax_mapping';
export const TAX_MAPPING_LINE_SCHEMA_NAME = 'accounting_tax_mapping_line';
export const TAX_RULE_SCHEMA_NAME = 'accounting_tax_rule';
export const TAX_RULE_CONDITION_SCHEMA_NAME = 'accounting_tax_rule_condition';
export const TAX_RULE_RESULT_SCHEMA_NAME = 'accounting_tax_rule_result';

/**
 * The dynamic resource engine serves a resource at `/v1/{module}/{schema_name}`, so the path
 * segment is the schema name itself rather than a pluralized noun.
 */
export const TAX_RESOURCE_PATH = `v1/accounting/${TAX_SCHEMA_NAME}`;
export const TAX_JURISDICTION_RESOURCE_PATH = `v1/accounting/${TAX_JURISDICTION_SCHEMA_NAME}`;
export const TAX_GROUP_RESOURCE_PATH = `v1/accounting/${TAX_GROUP_SCHEMA_NAME}`;
export const TAX_ROUNDING_POLICY_RESOURCE_PATH = `v1/accounting/${TAX_ROUNDING_POLICY_SCHEMA_NAME}`;
export const TAX_PRODUCT_CLASSIFICATION_RESOURCE_PATH = `v1/accounting/${TAX_PRODUCT_CLASSIFICATION_SCHEMA_NAME}`;
export const TAX_DEFINITION_VERSION_RESOURCE_PATH = `v1/accounting/${TAX_DEFINITION_VERSION_SCHEMA_NAME}`;
export const TAX_RATE_VERSION_RESOURCE_PATH = `v1/accounting/${TAX_RATE_VERSION_SCHEMA_NAME}`;
export const TAX_COMPONENT_RESOURCE_PATH = `v1/accounting/${TAX_COMPONENT_SCHEMA_NAME}`;
export const TAX_MAPPING_RESOURCE_PATH = `v1/accounting/${TAX_MAPPING_SCHEMA_NAME}`;
export const TAX_MAPPING_LINE_RESOURCE_PATH = `v1/accounting/${TAX_MAPPING_LINE_SCHEMA_NAME}`;
export const TAX_RULE_RESOURCE_PATH = `v1/accounting/${TAX_RULE_SCHEMA_NAME}`;
export const TAX_RULE_CONDITION_RESOURCE_PATH = `v1/accounting/${TAX_RULE_CONDITION_SCHEMA_NAME}`;
export const TAX_RULE_RESULT_RESOURCE_PATH = `v1/accounting/${TAX_RULE_RESULT_SCHEMA_NAME}`;

/**
 * The tax engine's own endpoints, which no resource engine serves.
 *
 * They are POST throughout, including the two that only read: the request is a whole document of
 * lines and party context, which does not fit a query string.
 */
export const TAX_CALCULATE_PATH = 'v1/accounting/tax/calculate';
export const TAX_SIMULATE_PATH = 'v1/accounting/tax/simulate';
export const TAX_REVERSE_FULL_PATH = 'v1/accounting/tax/reverse-full';
export const TAX_REVERSE_PARTIAL_PATH = 'v1/accounting/tax/reverse-partial';

/**
 * Lifecycle states of a versioned tax configuration, matching `enums.go`.
 *
 * They are named here because the contextual actions are gated on them, and an action whose
 * condition names a state that does not exist is simply never offered — invisible rather than an
 * error.
 */
export const LIFECYCLE_DRAFT = 'draft';
export const LIFECYCLE_PUBLISHED = 'published';
export const LIFECYCLE_WITHDRAWN = 'withdrawn';

/**
 * Determination outcomes, as reported per line by the calculation endpoints.
 *
 * `unresolved` is not a zero: it means the engine could not decide, and the simulator has to show
 * the error code rather than render an amount nobody computed (TAX-INV-07).
 */
export const DETERMINATION_RESOLVED = 'resolved';
export const DETERMINATION_NO_TAX_APPLICABLE = 'no_tax_applicable';
export const DETERMINATION_UNRESOLVED = 'unresolved';

/**
 * Operation types the engine accepts. V1 defines sale semantics only; the purchase values exist in
 * the backend enum as a reserved contract and are rejected by the application service.
 */
export const OPERATION_SALE = 'sale';
export const OPERATION_SALE_REFUND = 'sale_refund';

/** Price inclusion modes, used as the simulator's document-level default. */
export const PRICE_MODE_INCLUDED = 'included';
export const PRICE_MODE_EXCLUDED = 'excluded';
