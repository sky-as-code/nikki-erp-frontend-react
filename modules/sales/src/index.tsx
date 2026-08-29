import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import { defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps } from '@nikkierp/ui/microApp';
import { MicroAppProvider } from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from './constants';
import { registerSalesBillCommands } from './features/salesBill/commands';
import { registerSalesBillLineCommands } from './features/salesBillLine/commands';
import { registerSalesBillRelationCommands } from './features/salesBillRelation/commands';
import { registerSalesChannelCommands } from './features/salesChannel/commands';
import { registerSalesComboCommands } from './features/salesCombo/commands';
import { registerSalesComboComponentCommands } from './features/salesComboComponent/commands';
import { registerSalesFiscalRequestCommands } from './features/salesFiscalRequest/commands';
import { registerSalesFulfillmentRequestCommands } from './features/salesFulfillmentRequest/commands';
import { registerSalesFulfillmentRequestLineCommands } from './features/salesFulfillmentRequestLine/commands';
import { registerSalesManualDiscountCommands } from './features/salesManualDiscount/commands';
import { registerSalesOrderCommands } from './features/salesOrder/commands';
import { registerSalesOrderAdjustmentCommands } from './features/salesOrderAdjustment/commands';
import { registerSalesOrderEventCommands } from './features/salesOrderEvent/commands';
import { registerSalesOrderLineCommands } from './features/salesOrderLine/commands';
import { registerSalesOrderLineComponentCommands } from './features/salesOrderLineComponent/commands';
import { registerSalesPaymentCommands } from './features/salesPayment/commands';
import { registerSalesPointCommands } from './features/salesPoint/commands';
import { registerSalesPricelistCommands } from './features/salesPricelist/commands';
import { registerSalesPricelistItemCommands } from './features/salesPricelistItem/commands';
import { registerSalesPromotionConditionGroupCommands } from './features/salesPromotionConditionGroup/commands';
import { registerSalesPromotionProgramCommands } from './features/salesPromotionProgram/commands';
import { registerSalesPromotionRewardCommands } from './features/salesPromotionReward/commands';
import { registerSalesQuotationCommands } from './features/salesQuotation/commands';
import { registerSalesQuotationLineCommands } from './features/salesQuotationLine/commands';
import { registerSalesVoucherCodeCommands } from './features/salesVoucherCode/commands';
import { registerSalesVoucherRedemptionCommands } from './features/salesVoucherRedemption/commands';
import { buildSalesMenu } from './menu';
import { buildSalesBillPages } from './pages/salesBill';
import { buildSalesChannelPages } from './pages/salesChannel';
import { buildSalesComboPages } from './pages/salesCombo';
import { buildSalesFiscalRequestPages } from './pages/salesFiscalRequest';
import { buildSalesOrderPages } from './pages/salesOrder';
import { buildSalesPaymentPages } from './pages/salesPayment';
import { buildSalesPointPages } from './pages/salesPoint';
import { buildSalesPricelistPages } from './pages/salesPricelist';
import { buildSalesPromotionProgramPages } from './pages/salesPromotionProgram';
import { buildSalesQuotationPages } from './pages/salesQuotation';
import { buildSalesVoucherCodePages } from './pages/salesVoucherCode';


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

		// No `registerReducer`: this module keeps its state in its own store (`./store`).
		registerModelSchemas();
		host.menuRegistry.register(buildSalesMenu(slug));
		// Ordered referenced-before-referencing, matching `registerModelSchemas` below: setup, then
		// pricing, then the documents that resolve through both.
		registerSalesChannelCommands(host.commandBus);
		registerSalesPointCommands(host.commandBus);
		registerSalesPricelistCommands(host.commandBus);
		registerSalesPricelistItemCommands(host.commandBus);
		registerSalesPromotionProgramCommands(host.commandBus);
		registerSalesPromotionConditionGroupCommands(host.commandBus);
		registerSalesPromotionRewardCommands(host.commandBus);
		registerSalesComboCommands(host.commandBus);
		registerSalesComboComponentCommands(host.commandBus);
		registerSalesVoucherCodeCommands(host.commandBus);
		registerSalesVoucherRedemptionCommands(host.commandBus);
		registerSalesQuotationCommands(host.commandBus);
		registerSalesQuotationLineCommands(host.commandBus);
		registerSalesOrderCommands(host.commandBus);
		registerSalesOrderLineCommands(host.commandBus);
		registerSalesOrderLineComponentCommands(host.commandBus);
		registerSalesOrderAdjustmentCommands(host.commandBus);
		registerSalesOrderEventCommands(host.commandBus);
		registerSalesManualDiscountCommands(host.commandBus);
		registerSalesBillCommands(host.commandBus);
		registerSalesBillLineCommands(host.commandBus);
		registerSalesBillRelationCommands(host.commandBus);
		registerSalesPaymentCommands(host.commandBus);
		registerSalesFulfillmentRequestCommands(host.commandBus);
		registerSalesFulfillmentRequestLineCommands(host.commandBus);
		registerSalesFiscalRequestCommands(host.commandBus);

		return {
			domType,
		};
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => [
		...buildSalesOrderPages(),
		...buildSalesQuotationPages(),
		...buildSalesBillPages(),
		...buildSalesPaymentPages(),
		...buildSalesFiscalRequestPages(),
		...buildSalesPricelistPages(),
		...buildSalesPromotionProgramPages(),
		...buildSalesComboPages(),
		...buildSalesVoucherCodePages(),
		...buildSalesChannelPages(),
		...buildSalesPointPages(),
	], []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages, indexElement: <h1>Sales</h1> }}
		/>
	);
}

/**
 * Every schema is registered, including those with no page of their own: relation selects and
 * related-records tables resolve through this registry, and an unregistered schema does not error —
 * the field shows a raw ULID, or the table never loads.
 *
 * `sales_integration_outbox` is deliberately absent (an at-least-once delivery queue nobody should
 * be able to "fix" by hand), as is `sales_channel_payment_rel` — the backend registers an engine
 * for it but routes it nowhere, so it is reachable only through the channel's payment-method actions.
 */
function registerModelSchemas(): void {
	schemaRegistry.register([
		...setupSchemas(),
		...pricingSchemas(),
		...documentSchemas(),
	]);
}

/** Channels and the points that belong to them. A point's channel is immutable. */
function setupSchemas() {
	return [{
		schemaName: c.SALES_CHANNEL_SCHEMA_NAME,
		resourcePath: c.SALES_CHANNEL_RESOURCE_PATH,
	}, {
		// After the channel it belongs to: this form's relation select resolves through that entry.
		schemaName: c.SALES_POINT_SCHEMA_NAME,
		resourcePath: c.SALES_POINT_RESOURCE_PATH,
	}];
}

/** What decides a price before any document exists: pricelists, promotions, combos, vouchers. */
function pricingSchemas() {
	return [{
		schemaName: c.SALES_PRICELIST_SCHEMA_NAME,
		resourcePath: c.SALES_PRICELIST_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_PRICELIST_ITEM_SCHEMA_NAME,
		resourcePath: c.SALES_PRICELIST_ITEM_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_PROMOTION_PROGRAM_SCHEMA_NAME,
		resourcePath: c.SALES_PROMOTION_PROGRAM_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME,
		resourcePath: c.SALES_PROMOTION_CONDITION_GROUP_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_PROMOTION_REWARD_SCHEMA_NAME,
		resourcePath: c.SALES_PROMOTION_REWARD_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_COMBO_SCHEMA_NAME,
		resourcePath: c.SALES_COMBO_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_COMBO_COMPONENT_SCHEMA_NAME,
		resourcePath: c.SALES_COMBO_COMPONENT_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_VOUCHER_CODE_SCHEMA_NAME,
		resourcePath: c.SALES_VOUCHER_CODE_RESOURCE_PATH,
	}, {
		// Read-only over HTTP: redemption is what enforces a voucher's usage limit.
		schemaName: c.SALES_VOUCHER_REDEMPTION_SCHEMA_NAME,
		resourcePath: c.SALES_VOUCHER_REDEMPTION_RESOURCE_PATH,
	}];
}

/** Registered after pricing: an order line records which promotion or combo priced it. */
function documentSchemas() {
	return [{
		schemaName: c.SALES_QUOTATION_SCHEMA_NAME,
		resourcePath: c.SALES_QUOTATION_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_QUOTATION_LINE_SCHEMA_NAME,
		resourcePath: c.SALES_QUOTATION_LINE_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_ORDER_SCHEMA_NAME,
		resourcePath: c.SALES_ORDER_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_ORDER_LINE_SCHEMA_NAME,
		resourcePath: c.SALES_ORDER_LINE_RESOURCE_PATH,
	}, {
		// Read-only: written by combo expansion.
		schemaName: c.SALES_ORDER_LINE_COMPONENT_SCHEMA_NAME,
		resourcePath: c.SALES_ORDER_LINE_COMPONENT_RESOURCE_PATH,
	}, {
		// Read-only: the pricing engine replaces the whole chain on every repricing.
		schemaName: c.SALES_ORDER_ADJUSTMENT_SCHEMA_NAME,
		resourcePath: c.SALES_ORDER_ADJUSTMENT_RESOURCE_PATH,
	}, {
		// Read-only: an audit trail a client can write is not one.
		schemaName: c.SALES_ORDER_EVENT_SCHEMA_NAME,
		resourcePath: c.SALES_ORDER_EVENT_RESOURCE_PATH,
	}, {
		// Read-only: granting goes through the order's action, which takes the actor from the
		// request context rather than accepting one.
		schemaName: c.SALES_MANUAL_DISCOUNT_SCHEMA_NAME,
		resourcePath: c.SALES_MANUAL_DISCOUNT_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_BILL_SCHEMA_NAME,
		resourcePath: c.SALES_BILL_RESOURCE_PATH,
	}, {
		// Read-only: allocations are written by splitting and merging.
		schemaName: c.SALES_BILL_LINE_SCHEMA_NAME,
		resourcePath: c.SALES_BILL_LINE_RESOURCE_PATH,
	}, {
		// Read-only: a writable lineage row could fabricate a payment trail.
		schemaName: c.SALES_BILL_RELATION_SCHEMA_NAME,
		resourcePath: c.SALES_BILL_RELATION_RESOURCE_PATH,
	}, {
		// Read-only: money is recorded through the bill's `pay` action and its six gates.
		schemaName: c.SALES_PAYMENT_SCHEMA_NAME,
		resourcePath: c.SALES_PAYMENT_RESOURCE_PATH,
	}, {
		// Read-only: a client able to write one could tell Inventory to move goods no sale asked for.
		schemaName: c.SALES_FULFILLMENT_REQUEST_SCHEMA_NAME,
		resourcePath: c.SALES_FULFILLMENT_REQUEST_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME,
		resourcePath: c.SALES_FULFILLMENT_REQUEST_LINE_RESOURCE_PATH,
	}, {
		// Create-and-read only: a fiscal document that could be edited afterwards would not be one.
		schemaName: c.SALES_FISCAL_REQUEST_SCHEMA_NAME,
		resourcePath: c.SALES_FISCAL_REQUEST_RESOURCE_PATH,
	}];
}
