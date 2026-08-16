export const INVENTORY_MODULE = 'inventory';

// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend .../modules/inventory/domain/models/{product_type,product_category,brand,
// product_attribute,product_attribute_value,product_template,product_variant}.go.
export const PRODUCT_TYPE_SCHEMA_NAME = 'inventory_product_type';
export const PRODUCT_CATEGORY_SCHEMA_NAME = 'inventory_product_category';
export const BRAND_SCHEMA_NAME = 'inventory_brand';
export const PRODUCT_ATTRIBUTE_SCHEMA_NAME = 'inventory_product_attribute';
export const PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME = 'inventory_product_attribute_value';
export const PRODUCT_TEMPLATE_SCHEMA_NAME = 'inventory_product_template';
export const PRODUCT_VARIANT_SCHEMA_NAME = 'inventory_product_variant';

// A price rule for a template or one of its variants. See BR §6.12.
export const PRODUCT_PRICE_SCHEMA_NAME = 'inventory_product_price';

// Stock. See backend .../modules/inventory/domain/models/{stock_location,stock_operation_type,
// stock_quant}.go.
export const INVENTORY_LOCATION_SCHEMA_NAME = 'inventory_location';
export const WAREHOUSE_SCHEMA_NAME = 'inventory_warehouse';
export const STORAGE_CATEGORY_SCHEMA_NAME = 'inventory_storage_category';
export const SUPPLY_RELATION_SCHEMA_NAME = 'inventory_warehouse_supply_relation';
export const PUTAWAY_RULE_SCHEMA_NAME = 'inventory_putaway_rule';
export const STOCK_OPERATION_TYPE_SCHEMA_NAME = 'inventory_stock_operation_type';
export const STOCK_QUANT_SCHEMA_NAME = 'inventory_stock_quant';

// Stock movement. See backend .../modules/inventory/domain/models/{stock_transfer,stock_move,
// stock_move_line,stock_move_dependency}.go.
export const STOCK_TRANSFER_SCHEMA_NAME = 'inventory_stock_transfer';
export const STOCK_MOVE_SCHEMA_NAME = 'inventory_stock_move';
export const STOCK_MOVE_LINE_SCHEMA_NAME = 'inventory_stock_move_line';
export const STOCK_MOVE_DEPENDENCY_SCHEMA_NAME = 'inventory_stock_move_dependency';

// Stock corrections. See backend .../modules/inventory/domain/models/stock_scrap.go.
export const STOCK_SCRAP_SCHEMA_NAME = 'inventory_stock_scrap';

// Stock's settings for a product line, currently the unit its balances are counted in. Owned by
// Stock rather than Product: see backend .../inventory/domain/models/stock_product_config.go.
export const STOCK_PRODUCT_CONFIG_SCHEMA_NAME = 'inventory_stock_product_config';

// The two junctions. They carry a template's attribute configuration, and are reached as related
// records of a template rather than as top-level pages of their own.
export const PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME = 'inventory_product_template_attribute';
export const PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME = 'inventory_product_template_attribute_value';
export const PRODUCT_VARIANT_ATTRIBUTE_VALUE_SCHEMA_NAME = 'inventory_product_variant_attribute_value';

/**
 * The dynamic resource engine serves a resource at `/v1/{module}/{schema_name}`, so the path
 * segment is the schema name itself rather than a pluralized noun.
 */
export const PRODUCT_TYPE_RESOURCE_PATH = `v1/inventory/${PRODUCT_TYPE_SCHEMA_NAME}`;
export const PRODUCT_CATEGORY_RESOURCE_PATH = `v1/inventory/${PRODUCT_CATEGORY_SCHEMA_NAME}`;
export const BRAND_RESOURCE_PATH = `v1/inventory/${BRAND_SCHEMA_NAME}`;
export const PRODUCT_ATTRIBUTE_RESOURCE_PATH = `v1/inventory/${PRODUCT_ATTRIBUTE_SCHEMA_NAME}`;
export const PRODUCT_ATTRIBUTE_VALUE_RESOURCE_PATH = `v1/inventory/${PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME}`;
export const PRODUCT_TEMPLATE_RESOURCE_PATH = `v1/inventory/${PRODUCT_TEMPLATE_SCHEMA_NAME}`;
export const PRODUCT_VARIANT_RESOURCE_PATH = `v1/inventory/${PRODUCT_VARIANT_SCHEMA_NAME}`;
export const PRODUCT_PRICE_RESOURCE_PATH = `v1/inventory/${PRODUCT_PRICE_SCHEMA_NAME}`;
export const PRODUCT_TEMPLATE_ATTRIBUTE_RESOURCE_PATH = `v1/inventory/${PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME}`;
export const PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_RESOURCE_PATH =
	`v1/inventory/${PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME}`;
export const PRODUCT_VARIANT_ATTRIBUTE_VALUE_RESOURCE_PATH =
	`v1/inventory/${PRODUCT_VARIANT_ATTRIBUTE_VALUE_SCHEMA_NAME}`;
export const INVENTORY_LOCATION_RESOURCE_PATH = `v1/inventory/${INVENTORY_LOCATION_SCHEMA_NAME}`;
export const WAREHOUSE_RESOURCE_PATH = `v1/inventory/${WAREHOUSE_SCHEMA_NAME}`;
export const STORAGE_CATEGORY_RESOURCE_PATH = `v1/inventory/${STORAGE_CATEGORY_SCHEMA_NAME}`;
export const SUPPLY_RELATION_RESOURCE_PATH = `v1/inventory/${SUPPLY_RELATION_SCHEMA_NAME}`;
export const PUTAWAY_RULE_RESOURCE_PATH = `v1/inventory/${PUTAWAY_RULE_SCHEMA_NAME}`;
export const STOCK_OPERATION_TYPE_RESOURCE_PATH = `v1/inventory/${STOCK_OPERATION_TYPE_SCHEMA_NAME}`;
export const STOCK_QUANT_RESOURCE_PATH = `v1/inventory/${STOCK_QUANT_SCHEMA_NAME}`;
export const STOCK_TRANSFER_RESOURCE_PATH = `v1/inventory/${STOCK_TRANSFER_SCHEMA_NAME}`;
export const STOCK_MOVE_RESOURCE_PATH = `v1/inventory/${STOCK_MOVE_SCHEMA_NAME}`;
export const STOCK_MOVE_LINE_RESOURCE_PATH = `v1/inventory/${STOCK_MOVE_LINE_SCHEMA_NAME}`;
export const STOCK_SCRAP_RESOURCE_PATH = `v1/inventory/${STOCK_SCRAP_SCHEMA_NAME}`;
export const STOCK_PRODUCT_CONFIG_RESOURCE_PATH = `v1/inventory/${STOCK_PRODUCT_CONFIG_SCHEMA_NAME}`;

/**
 * Custom action paths on the Product Template engine. The engine's route pattern rejects hyphens,
 * so these are underscored. See backend .../inventory/dynamicengines/product_template.go.
 */
export const GENERATE_VARIANTS_PATH = 'generate_variants';
export const RESOLVE_SELECTION_PATH = 'resolve_selection';
