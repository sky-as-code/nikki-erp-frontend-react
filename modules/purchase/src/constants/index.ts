export const PURCHASE_MODULE = 'purchase';

// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend-coremart26-mono/nikkierp/modules/purchase/domain/models/{purchase_order,
// purchase_order_line,agreement,agreement_line,configuration,sourcing_group,audit_event}.go.
//
// Note the order is `purchase_order`, NOT `purchase_purchase_order`: the module prefix and the
// entity name coincide, so the schema name carries it only once.
export const PURCHASE_ORDER_SCHEMA_NAME = 'purchase_order';
export const PURCHASE_ORDER_LINE_SCHEMA_NAME = 'purchase_order_line';
export const AGREEMENT_SCHEMA_NAME = 'purchase_agreement';
export const AGREEMENT_LINE_SCHEMA_NAME = 'purchase_agreement_line';
export const CONFIGURATION_SCHEMA_NAME = 'purchase_configuration';
export const SOURCING_GROUP_SCHEMA_NAME = 'purchase_sourcing_group';
export const AUDIT_EVENT_SCHEMA_NAME = 'purchase_audit_event';
export const VENDOR_PRODUCT_PRICE_SCHEMA_NAME = 'purchase_vendor_product_price';

/**
 * The dynamic resource engine serves a resource at `/v1/{module}/{schema_name}`, so the path
 * segment is the schema name itself rather than a pluralized noun.
 */
export const PURCHASE_ORDER_RESOURCE_PATH = `v1/purchase/${PURCHASE_ORDER_SCHEMA_NAME}`;
export const PURCHASE_ORDER_LINE_RESOURCE_PATH = `v1/purchase/${PURCHASE_ORDER_LINE_SCHEMA_NAME}`;
export const AGREEMENT_RESOURCE_PATH = `v1/purchase/${AGREEMENT_SCHEMA_NAME}`;
export const AGREEMENT_LINE_RESOURCE_PATH = `v1/purchase/${AGREEMENT_LINE_SCHEMA_NAME}`;
export const CONFIGURATION_RESOURCE_PATH = `v1/purchase/${CONFIGURATION_SCHEMA_NAME}`;
export const SOURCING_GROUP_RESOURCE_PATH = `v1/purchase/${SOURCING_GROUP_SCHEMA_NAME}`;
export const AUDIT_EVENT_RESOURCE_PATH = `v1/purchase/${AUDIT_EVENT_SCHEMA_NAME}`;
export const VENDOR_PRODUCT_PRICE_RESOURCE_PATH = `v1/purchase/${VENDOR_PRODUCT_PRICE_SCHEMA_NAME}`;

/**
 * Purchase order statuses, matching the enum in the backend's `statuses.go`.
 *
 * They are named here because [PUR-024]'s lifecycle actions are gated on them, and a contextual
 * action whose condition names a status that does not exist is simply never offered — which is
 * invisible rather than an error.
 *
 * `purchase_order` is a status of the order, not a second resource. It is the confirmed state:
 * `rfq` and `rfq_sent` are the quotation stages of the same record (PUR-R1).
 */
export const ORDER_STATUS_RFQ = 'rfq';
export const ORDER_STATUS_RFQ_SENT = 'rfq_sent';
export const ORDER_STATUS_TO_APPROVE = 'to_approve';
export const ORDER_STATUS_PURCHASE_ORDER = 'purchase_order';
export const ORDER_STATUS_CANCELLED = 'cancelled';

/** Agreement statuses, matching the enum in the backend's `statuses.go`. */
export const AGREEMENT_STATUS_DRAFT = 'draft';
export const AGREEMENT_STATUS_CONFIRMED = 'confirmed';
export const AGREEMENT_STATUS_CLOSED = 'closed';
export const AGREEMENT_STATUS_CANCELLED = 'cancelled';

/**
 * Custom action sub-paths on the purchase order and agreement engines. The engine's route pattern
 * rejects hyphens, so these are underscored. See
 * backend .../purchase/dynamicengines/{order_actions,agreement_actions}.go.
 */
export const CONFIRM_PATH = 'confirm';
export const APPROVE_PATH = 'approve';
export const CANCEL_PATH = 'cancel';
export const SEND_PATH = 'send';
export const LOCK_PATH = 'lock';
export const UNLOCK_PATH = 'unlock';
export const ACKNOWLEDGE_PATH = 'acknowledge';
export const DUPLICATE_PATH = 'duplicate';
export const MERGE_PATH = 'merge';
export const CREATE_ALTERNATIVE_PATH = 'create_alternative';
export const COMPARE_ALTERNATIVES_PATH = 'compare_alternatives';
export const CLOSE_PATH = 'close';
export const CREATE_RFQ_PATH = 'create_rfq';
export const REPRICE_PATH = 'reprice';
