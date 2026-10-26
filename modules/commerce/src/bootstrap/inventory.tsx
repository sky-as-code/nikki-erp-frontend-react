import { schemaRegistry } from '@nikkierp/common/dynamicModel';

import * as c from '../constants/inventory';
import { registerBrandCommands } from '../features/inventory/brand/commands';
import { registerInventoryLocationCommands } from '../features/inventory/inventoryLocation/commands';
import { registerProductAttributeCommands } from '../features/inventory/productAttribute/commands';
import { registerProductAttributeValueCommands } from '../features/inventory/productAttributeValue/commands';
import { registerProductCategoryCommands } from '../features/inventory/productCategory/commands';
import { registerProductStockCommands } from '../features/inventory/productStock/commands';
import { registerProductTemplateCommands } from '../features/inventory/productTemplate/commands';
import { registerProductTemplateAttributeCommands } from '../features/inventory/productTemplateAttribute/commands';
import { registerProductTemplateAttributeValueCommands } from '../features/inventory/productTemplateAttributeValue/commands';
import { registerProductVariantCommands } from '../features/inventory/productVariant/commands';
import { registerPutawayRuleCommands } from '../features/inventory/putawayRule/commands';
import { registerStockMoveCommands } from '../features/inventory/stockMove/commands';
import { registerStockMoveLineCommands } from '../features/inventory/stockMoveLine/commands';
import { registerStockOperationTypeCommands } from '../features/inventory/stockOperationType/commands';
import { registerStockProductConfigCommands } from '../features/inventory/stockProductConfig/commands';
import { registerStockQuantCommands } from '../features/inventory/stockQuant/commands';
import { registerStockReservationCommands } from '../features/inventory/stockReservation/commands';
import { registerStockScrapCommands } from '../features/inventory/stockScrap/commands';
import { registerStockTransferCommands } from '../features/inventory/stockTransfer/commands';
import { registerStorageCategoryCommands } from '../features/inventory/storageCategory/commands';
import { registerSupplyRelationCommands } from '../features/inventory/supplyRelation/commands';
import { registerWarehouseCommands } from '../features/inventory/warehouse/commands';
import { buildBrandPages } from '../pages/inventory/brand';
import { buildInventoryLocationPages } from '../pages/inventory/inventoryLocation';
import { buildProductAttributePages } from '../pages/inventory/productAttribute';
import { buildProductAttributeValuePages } from '../pages/inventory/productAttributeValue';
import { buildProductCategoryPages } from '../pages/inventory/productCategory';
import { buildProductTemplatePages } from '../pages/inventory/productTemplate';
import { buildProductTemplateAttributeValuePages } from '../pages/inventory/productTemplateAttributeValue';
import { buildProductVariantPages } from '../pages/inventory/productVariant';
import { buildPutawayRulePages } from '../pages/inventory/putawayRule';
import { buildStockQuantPages } from '../pages/inventory/stockQuant';
import { buildStockReservationPages } from '../pages/inventory/stockReservation';
import { buildStockScrapPages } from '../pages/inventory/stockScrap';
import { buildStockTransferPages } from '../pages/inventory/stockTransfer';
import { buildStorageCategoryPages } from '../pages/inventory/storageCategory';
import { buildSupplyRelationPages } from '../pages/inventory/supplyRelation';
import { buildWarehousePages } from '../pages/inventory/warehouse';
import { contributeInventoryViewKit } from '../viewkit/inventory/kit';

import type { HostServices } from '@nikkierp/ui/microApp';
import type { PageNode } from '@nikkierp/viewengine/metadata';


/** Everything `inventory` contributes to the host when the commerce bundle initialises. */
export function registerInventory(host: HostServices): void {
	// No `registerReducer`: inventory keeps its state in its own store (`../store/inventory`), and
	// reaches the Shell only through the command and event buses.
	registerModelSchemas();
	contributeInventoryViewKit(host.viewEngine);
	registerProductCategoryCommands(host.commandBus);
	registerBrandCommands(host.commandBus);
	registerProductAttributeCommands(host.commandBus);
	registerProductAttributeValueCommands(host.commandBus);
	registerProductTemplateCommands(host.commandBus);
	registerProductTemplateAttributeCommands(host.commandBus);
	registerProductTemplateAttributeValueCommands(host.commandBus);
	registerProductVariantCommands(host.commandBus);
	registerInventoryLocationCommands(host.commandBus);
	registerWarehouseCommands(host.commandBus);
	registerStorageCategoryCommands(host.commandBus);
	registerSupplyRelationCommands(host.commandBus);
	registerPutawayRuleCommands(host.commandBus);
	registerStockOperationTypeCommands(host.commandBus);
	registerStockQuantCommands(host.commandBus);
	// After the quant registration: both name the quant resource, and this one deliberately
	// does not re-register the CRUD service that one installs.
	registerProductStockCommands(host.commandBus);
	registerStockTransferCommands(host.commandBus);
	registerStockMoveCommands(host.commandBus);
	registerStockMoveLineCommands(host.commandBus);
	registerStockScrapCommands(host.commandBus);
	registerStockReservationCommands(host.commandBus);
	registerStockProductConfigCommands(host.commandBus);
}

export function buildInventoryPages(): PageNode[] {
	return [
		...buildProductTemplatePages(),
		...buildProductVariantPages(),
		...buildProductCategoryPages(),
		...buildBrandPages(),
		...buildProductAttributePages(),
		...buildProductAttributeValuePages(),
		...buildProductTemplateAttributeValuePages(),
		...buildInventoryLocationPages(),
		...buildWarehousePages(),
		...buildStorageCategoryPages(),
		...buildSupplyRelationPages(),
		...buildPutawayRulePages(),
		...buildStockQuantPages(),
		...buildStockTransferPages(),
		...buildStockScrapPages(),
		...buildStockReservationPages(),
	];
}

function registerModelSchemas(): void {
	schemaRegistry.register([{
		schemaName: c.PRODUCT_CATEGORY_SCHEMA_NAME,
		resourcePath: c.PRODUCT_CATEGORY_RESOURCE_PATH,
	}, {
		schemaName: c.BRAND_SCHEMA_NAME,
		resourcePath: c.BRAND_RESOURCE_PATH,
	}, {
		schemaName: c.PRODUCT_ATTRIBUTE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_ATTRIBUTE_RESOURCE_PATH,
	}, {
		schemaName: c.PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_ATTRIBUTE_VALUE_RESOURCE_PATH,
	}, {
		schemaName: c.PRODUCT_TEMPLATE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_TEMPLATE_RESOURCE_PATH,
	}, {
		schemaName: c.PRODUCT_VARIANT_SCHEMA_NAME,
		resourcePath: c.PRODUCT_VARIANT_RESOURCE_PATH,
	}, {
		// The junctions carry a template's attribute configuration. They have no page of their
		// own, but a related-records table reaches them through the same registered schema.
		schemaName: c.PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_TEMPLATE_ATTRIBUTE_RESOURCE_PATH,
	}, {
		schemaName: c.PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_RESOURCE_PATH,
	}, {
		schemaName: c.PRODUCT_VARIANT_ATTRIBUTE_VALUE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_VARIANT_ATTRIBUTE_VALUE_RESOURCE_PATH,
	}, {
		schemaName: c.WAREHOUSE_SCHEMA_NAME,
		resourcePath: c.WAREHOUSE_RESOURCE_PATH,
	}, {
		schemaName: c.STORAGE_CATEGORY_SCHEMA_NAME,
		resourcePath: c.STORAGE_CATEGORY_RESOURCE_PATH,
	}, {
		schemaName: c.INVENTORY_LOCATION_SCHEMA_NAME,
		resourcePath: c.INVENTORY_LOCATION_RESOURCE_PATH,
	}, {
		schemaName: c.SUPPLY_RELATION_SCHEMA_NAME,
		resourcePath: c.SUPPLY_RELATION_RESOURCE_PATH,
	}, {
		schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
		resourcePath: c.PUTAWAY_RULE_RESOURCE_PATH,
	}, {
		// No page of its own yet, but registered so that a relation select pointing at an
		// operation type can already resolve it.
		schemaName: c.STOCK_OPERATION_TYPE_SCHEMA_NAME,
		resourcePath: c.STOCK_OPERATION_TYPE_RESOURCE_PATH,
	}, {
		schemaName: c.STOCK_QUANT_SCHEMA_NAME,
		resourcePath: c.STOCK_QUANT_RESOURCE_PATH,
	}, {
		schemaName: c.STOCK_TRANSFER_SCHEMA_NAME,
		resourcePath: c.STOCK_TRANSFER_RESOURCE_PATH,
	}, {
		// Moves and their lines have no page of their own: they are reached as related records of
		// the transfer that owns them, through the same registered schema.
		schemaName: c.STOCK_MOVE_SCHEMA_NAME,
		resourcePath: c.STOCK_MOVE_RESOURCE_PATH,
	}, {
		schemaName: c.STOCK_MOVE_LINE_SCHEMA_NAME,
		resourcePath: c.STOCK_MOVE_LINE_RESOURCE_PATH,
	}, {
		schemaName: c.STOCK_SCRAP_SCHEMA_NAME,
		resourcePath: c.STOCK_SCRAP_RESOURCE_PATH,
	}, {
		// Read-only over HTTP: a reservation is written by reserving, consuming, releasing and
		// protecting, never by editing the row. Reached from a sales order's items as well.
		schemaName: c.STOCK_RESERVATION_SCHEMA_NAME,
		resourcePath: c.STOCK_RESERVATION_RESOURCE_PATH,
	}, {
		// Reached as a related record of a product template rather than as a page of its own:
		// the unit a product's stock is counted in is configured where the product is.
		schemaName: c.STOCK_PRODUCT_CONFIG_SCHEMA_NAME,
		resourcePath: c.STOCK_PRODUCT_CONFIG_RESOURCE_PATH,
	}]);
}
