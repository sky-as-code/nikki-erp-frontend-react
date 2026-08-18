export const PAYMENTINVOICE_MODULE = 'paymentinvoice';

// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend-coremart26-mono/nikkierp/modules/paymentinvoice/domain/models/{payment_method,order,
// transaction,invoice,invoice_line}.go.
//
// Note the backend module is `paymentinvoice` on both sides, unlike identity/iam: there is no
// rename pending here.
export const PAYMENT_METHOD_SCHEMA_NAME = 'paymentinvoice_payment_method';
export const ORDER_SCHEMA_NAME = 'paymentinvoice_order';
export const TRANSACTION_SCHEMA_NAME = 'paymentinvoice_transaction';
export const INVOICE_SCHEMA_NAME = 'paymentinvoice_invoice';
export const INVOICE_LINE_SCHEMA_NAME = 'paymentinvoice_invoice_line';

/**
 * The dynamic resource engine serves a resource at `/v1/{module}/{schema_name}`, so the path
 * segment is the schema name itself rather than a pluralized noun.
 */
export const PAYMENT_METHOD_RESOURCE_PATH = `v1/paymentinvoice/${PAYMENT_METHOD_SCHEMA_NAME}`;
export const ORDER_RESOURCE_PATH = `v1/paymentinvoice/${ORDER_SCHEMA_NAME}`;
export const TRANSACTION_RESOURCE_PATH = `v1/paymentinvoice/${TRANSACTION_SCHEMA_NAME}`;
export const INVOICE_RESOURCE_PATH = `v1/paymentinvoice/${INVOICE_SCHEMA_NAME}`;
export const INVOICE_LINE_RESOURCE_PATH = `v1/paymentinvoice/${INVOICE_LINE_SCHEMA_NAME}`;

/**
 * Order statuses, matching the enum in the backend's order.json.
 *
 * They are named here because the refund action is gated on one of them: a contextual action whose
 * condition names a status that does not exist is simply never offered, which is invisible.
 */
export const ORDER_STATUS_PAYMENT_SUCCESS = 'payment_success';

/** Invoice statuses, matching the enum in the backend's invoice.json. */
export const INVOICE_STATUS_DRAFT = 'draft';
