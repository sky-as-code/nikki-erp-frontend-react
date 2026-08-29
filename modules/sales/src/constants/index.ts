export const SALES_MODULE = 'sales';

/**
 * Schema names, verbatim copies of the backend Go constants in
 * backend-coremart26-mono/nikkierp/modules/sales/domain/models/*.go. A near-miss fails silently:
 * `SchemaRegistry` never resolves and the page hangs on its spinner. Note `sales_order`, not
 * `sales_sales_order` — where the module prefix and the entity word coincide, it appears once.
 */
export const SALES_ORDER_SCHEMA_NAME = 'sales_order';
export const SALES_ORDER_LINE_SCHEMA_NAME = 'sales_order_line';
export const SALES_ORDER_LINE_COMPONENT_SCHEMA_NAME = 'sales_order_line_component';
export const SALES_ORDER_ADJUSTMENT_SCHEMA_NAME = 'sales_order_adjustment';
export const SALES_ORDER_EVENT_SCHEMA_NAME = 'sales_order_event';
export const SALES_QUOTATION_SCHEMA_NAME = 'sales_quotation';
export const SALES_QUOTATION_LINE_SCHEMA_NAME = 'sales_quotation_line';
export const SALES_BILL_SCHEMA_NAME = 'sales_bill';
export const SALES_BILL_LINE_SCHEMA_NAME = 'sales_bill_line';
export const SALES_BILL_RELATION_SCHEMA_NAME = 'sales_bill_relation';
export const SALES_PAYMENT_SCHEMA_NAME = 'sales_payment';
export const SALES_CHANNEL_SCHEMA_NAME = 'sales_channel';
export const SALES_POINT_SCHEMA_NAME = 'sales_point';
export const SALES_PRICELIST_SCHEMA_NAME = 'sales_pricelist';
export const SALES_PRICELIST_ITEM_SCHEMA_NAME = 'sales_pricelist_item';
export const SALES_PROMOTION_PROGRAM_SCHEMA_NAME = 'sales_promotion_program';
export const SALES_PROMOTION_REWARD_SCHEMA_NAME = 'sales_promotion_reward';
export const SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME = 'sales_promotion_condition_group';
export const SALES_COMBO_SCHEMA_NAME = 'sales_combo';
export const SALES_COMBO_COMPONENT_SCHEMA_NAME = 'sales_combo_component';
export const SALES_VOUCHER_CODE_SCHEMA_NAME = 'sales_voucher_code';
export const SALES_VOUCHER_REDEMPTION_SCHEMA_NAME = 'sales_voucher_redemption';
export const SALES_FISCAL_REQUEST_SCHEMA_NAME = 'sales_fiscal_request';
export const SALES_FULFILLMENT_REQUEST_SCHEMA_NAME = 'sales_fulfillment_request';
export const SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME = 'sales_fulfillment_request_line';
export const SALES_MANUAL_DISCOUNT_SCHEMA_NAME = 'sales_manual_discount';

/**
 * The engine serves a resource at `/v1/{module}/{schema_name}`, so the path segment is the schema
 * name itself — singular snake_case. A pluralised path 404s every request.
 */
export const SALES_ORDER_RESOURCE_PATH = `v1/sales/${SALES_ORDER_SCHEMA_NAME}`;
export const SALES_ORDER_LINE_RESOURCE_PATH = `v1/sales/${SALES_ORDER_LINE_SCHEMA_NAME}`;
export const SALES_ORDER_LINE_COMPONENT_RESOURCE_PATH = `v1/sales/${SALES_ORDER_LINE_COMPONENT_SCHEMA_NAME}`;
export const SALES_ORDER_ADJUSTMENT_RESOURCE_PATH = `v1/sales/${SALES_ORDER_ADJUSTMENT_SCHEMA_NAME}`;
export const SALES_ORDER_EVENT_RESOURCE_PATH = `v1/sales/${SALES_ORDER_EVENT_SCHEMA_NAME}`;
export const SALES_QUOTATION_RESOURCE_PATH = `v1/sales/${SALES_QUOTATION_SCHEMA_NAME}`;
export const SALES_QUOTATION_LINE_RESOURCE_PATH = `v1/sales/${SALES_QUOTATION_LINE_SCHEMA_NAME}`;
export const SALES_BILL_RESOURCE_PATH = `v1/sales/${SALES_BILL_SCHEMA_NAME}`;
export const SALES_BILL_LINE_RESOURCE_PATH = `v1/sales/${SALES_BILL_LINE_SCHEMA_NAME}`;
export const SALES_BILL_RELATION_RESOURCE_PATH = `v1/sales/${SALES_BILL_RELATION_SCHEMA_NAME}`;
export const SALES_PAYMENT_RESOURCE_PATH = `v1/sales/${SALES_PAYMENT_SCHEMA_NAME}`;
export const SALES_CHANNEL_RESOURCE_PATH = `v1/sales/${SALES_CHANNEL_SCHEMA_NAME}`;
export const SALES_POINT_RESOURCE_PATH = `v1/sales/${SALES_POINT_SCHEMA_NAME}`;
export const SALES_PRICELIST_RESOURCE_PATH = `v1/sales/${SALES_PRICELIST_SCHEMA_NAME}`;
export const SALES_PRICELIST_ITEM_RESOURCE_PATH = `v1/sales/${SALES_PRICELIST_ITEM_SCHEMA_NAME}`;
export const SALES_PROMOTION_PROGRAM_RESOURCE_PATH = `v1/sales/${SALES_PROMOTION_PROGRAM_SCHEMA_NAME}`;
export const SALES_PROMOTION_REWARD_RESOURCE_PATH = `v1/sales/${SALES_PROMOTION_REWARD_SCHEMA_NAME}`;
export const SALES_PROMOTION_CONDITION_GROUP_RESOURCE_PATH = `v1/sales/${SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME}`;
export const SALES_COMBO_RESOURCE_PATH = `v1/sales/${SALES_COMBO_SCHEMA_NAME}`;
export const SALES_COMBO_COMPONENT_RESOURCE_PATH = `v1/sales/${SALES_COMBO_COMPONENT_SCHEMA_NAME}`;
export const SALES_VOUCHER_CODE_RESOURCE_PATH = `v1/sales/${SALES_VOUCHER_CODE_SCHEMA_NAME}`;
export const SALES_VOUCHER_REDEMPTION_RESOURCE_PATH = `v1/sales/${SALES_VOUCHER_REDEMPTION_SCHEMA_NAME}`;
export const SALES_FISCAL_REQUEST_RESOURCE_PATH = `v1/sales/${SALES_FISCAL_REQUEST_SCHEMA_NAME}`;
export const SALES_FULFILLMENT_REQUEST_RESOURCE_PATH = `v1/sales/${SALES_FULFILLMENT_REQUEST_SCHEMA_NAME}`;
export const SALES_FULFILLMENT_REQUEST_LINE_RESOURCE_PATH = `v1/sales/${SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME}`;
export const SALES_MANUAL_DISCOUNT_RESOURCE_PATH = `v1/sales/${SALES_MANUAL_DISCOUNT_SCHEMA_NAME}`;

/**
 * Statuses, matching the enums in the backend's `domain/models/statuses.go`. Contextual actions are
 * gated on them, and an action whose condition names a status that does not exist is silently never
 * offered — no error, just a missing button.
 */
export const ORDER_STATUS_DRAFT = 'draft';
export const ORDER_STATUS_CONFIRMED = 'confirmed';
export const ORDER_STATUS_PROCESSING = 'processing';
export const ORDER_STATUS_COMPLETED = 'completed';
export const ORDER_STATUS_CANCELLED = 'cancelled';

export const QUOTATION_STATUS_DRAFT = 'draft';
export const QUOTATION_STATUS_SENT = 'sent';
export const QUOTATION_STATUS_ACCEPTED = 'accepted';
export const QUOTATION_STATUS_EXPIRED = 'expired';
export const QUOTATION_STATUS_CANCELLED = 'cancelled';

export const BILL_STATUS_OPEN = 'open';
export const BILL_STATUS_SETTLED = 'settled';
export const BILL_STATUS_CANCELLED = 'cancelled';

export const CHANNEL_STATUS_ACTIVE = 'active';
export const CHANNEL_STATUS_SUSPENDED = 'suspended';

/**
 * Custom action sub-paths on the Sales engines; the engine's route pattern rejects hyphens, so
 * these are underscored. Some do not match their business name: recording a payment posts to `pay`,
 * and a VAT invoice posts to `request_invoice` on the fiscal request resource, not the bill.
 */
export const CONFIRM_PATH = 'confirm';
export const CANCEL_PATH = 'cancel';
export const REPRICE_PATH = 'reprice';
export const APPLY_VOUCHER_PATH = 'apply_voucher';
export const EXPLAIN_PRICE_PATH = 'explain_price';
export const MANUAL_DISCOUNT_PATH = 'manual_discount';
export const REVOKE_MANUAL_DISCOUNT_PATH = 'revoke_manual_discount';
export const CREATE_ORDER_PATH = 'create_order';

export const SPLIT_PATH = 'split';
export const MERGE_PATH = 'merge';
export const PAY_PATH = 'pay';
export const SETTLE_PATH = 'settle';

export const CONVERT_PATH = 'convert';
export const SEND_PATH = 'send';

export const SUSPEND_PATH = 'suspend';
export const ACTIVATE_PATH = 'activate';
export const ARCHIVE_PATH = 'archive';
export const UNARCHIVE_PATH = 'unarchive';
export const RESOLVE_PATH = 'resolve';
export const PAYMENT_METHODS_PATH = 'payment_methods';
export const ENABLE_PAYMENT_METHOD_PATH = 'enable_payment_method';
export const DISABLE_PAYMENT_METHOD_PATH = 'disable_payment_method';

export const SET_DEFAULT_PATH = 'set_default';
export const REQUEST_INVOICE_PATH = 'request_invoice';
