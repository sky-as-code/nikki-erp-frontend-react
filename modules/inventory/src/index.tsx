import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import { defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps } from '@nikkierp/ui/microApp';
import { MicroAppProvider } from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from './constants';
import { registerBrandCommands } from './features/brand/commands';
import { registerProductAttributeCommands } from './features/productAttribute/commands';
import { registerProductAttributeValueCommands } from './features/productAttributeValue/commands';
import { registerProductCategoryCommands } from './features/productCategory/commands';
import { registerProductPriceCommands } from './features/productPrice/commands';
import { registerProductTemplateCommands } from './features/productTemplate/commands';
import { registerProductTemplateAttributeCommands } from './features/productTemplateAttribute/commands';
import { registerProductTypeCommands } from './features/productType/commands';
import { registerProductVariantCommands } from './features/productVariant/commands';
import { registerStockLocationCommands } from './features/stockLocation/commands';
import { registerStockMoveCommands } from './features/stockMove/commands';
import { registerStockMoveLineCommands } from './features/stockMoveLine/commands';
import { registerStockOperationTypeCommands } from './features/stockOperationType/commands';
import { registerStockQuantCommands } from './features/stockQuant/commands';
import { registerStockScrapCommands } from './features/stockScrap/commands';
import { registerStockTransferCommands } from './features/stockTransfer/commands';
import { buildInventoryMenu } from './menu';
import { buildBrandPages } from './pages/brand';
import { buildProductAttributePages } from './pages/productAttribute';
import { buildProductAttributeValuePages } from './pages/productAttributeValue';
import { buildProductCategoryPages } from './pages/productCategory';
import { buildProductPricePages } from './pages/productPrice';
import { buildProductTemplatePages } from './pages/productTemplate';
import { buildProductTypePages } from './pages/productType';
import { buildProductVariantPages } from './pages/productVariant';
import { buildStockLocationPages } from './pages/stockLocation';
import { buildStockQuantPages } from './pages/stockQuant';
import { buildStockScrapPages } from './pages/stockScrap';
import { buildStockTransferPages } from './pages/stockTransfer';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, slug, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		// No `registerReducer`: inventory keeps its state in its own store (`./store`), and
		// reaches the Shell only through the command and event buses.
		registerModelSchemas();
		host.menuRegistry.register(buildInventoryMenu(slug));
		registerProductTypeCommands(host.commandBus);
		registerProductCategoryCommands(host.commandBus);
		registerBrandCommands(host.commandBus);
		registerProductAttributeCommands(host.commandBus);
		registerProductAttributeValueCommands(host.commandBus);
		registerProductTemplateCommands(host.commandBus);
		registerProductTemplateAttributeCommands(host.commandBus);
		registerProductVariantCommands(host.commandBus);
		registerProductPriceCommands(host.commandBus);
		registerStockLocationCommands(host.commandBus);
		registerStockOperationTypeCommands(host.commandBus);
		registerStockQuantCommands(host.commandBus);
		registerStockTransferCommands(host.commandBus);
		registerStockMoveCommands(host.commandBus);
		registerStockMoveLineCommands(host.commandBus);
		registerStockScrapCommands(host.commandBus);

		return {
			domType,
		};
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => [
		...buildProductTemplatePages(),
		...buildProductVariantPages(),
		...buildProductTypePages(),
		...buildProductCategoryPages(),
		...buildBrandPages(),
		...buildProductAttributePages(),
		...buildProductAttributeValuePages(),
		...buildProductPricePages(),
		...buildStockLocationPages(),
		...buildStockQuantPages(),
		...buildStockTransferPages(),
		...buildStockScrapPages(),
	], []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages, indexElement: <h1>Inventory</h1> }}
		/>
	);
}

function registerModelSchemas(): void {
	schemaRegistry.register([{
		schemaName: c.PRODUCT_TYPE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_TYPE_RESOURCE_PATH,
	}, {
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
		schemaName: c.PRODUCT_PRICE_SCHEMA_NAME,
		resourcePath: c.PRODUCT_PRICE_RESOURCE_PATH,
	}, {
		schemaName: c.STOCK_LOCATION_SCHEMA_NAME,
		resourcePath: c.STOCK_LOCATION_RESOURCE_PATH,
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
	}]);
}
