import { schemaRegistry } from '@nikkierp/common/dynamicModel';

import * as c from '../constants/sales';
import { registerSalesBillCommands } from '../features/sales/salesBill/commands';
import { registerSalesBillLineCommands } from '../features/sales/salesBillLine/commands';
import { registerSalesBillRelationCommands } from '../features/sales/salesBillRelation/commands';
import { registerSalesChannelCommands } from '../features/sales/salesChannel/commands';
import { registerSalesComboCommands } from '../features/sales/salesCombo/commands';
import { registerSalesComboComponentCommands } from '../features/sales/salesComboComponent/commands';
import { registerSalesFiscalRequestCommands } from '../features/sales/salesFiscalRequest/commands';
import { registerSalesFulfillmentRequestCommands } from '../features/sales/salesFulfillmentRequest/commands';
import { registerSalesFulfillmentRequestLineCommands } from '../features/sales/salesFulfillmentRequestLine/commands';
import { registerSalesManualDiscountCommands } from '../features/sales/salesManualDiscount/commands';
import { registerSalesOrderCommands } from '../features/sales/salesOrder/commands';
import { registerSalesOrderAdjustmentCommands } from '../features/sales/salesOrderAdjustment/commands';
import { registerSalesOrderEventCommands } from '../features/sales/salesOrderEvent/commands';
import { registerSalesOrderFulfillmentCommands } from '../features/sales/salesOrderFulfillment/commands';
import { registerSalesOrderFulfillmentItemCommands } from '../features/sales/salesOrderFulfillmentItem/commands';
import { registerSalesOrderLineCommands } from '../features/sales/salesOrderLine/commands';
import { registerSalesOrderLineComponentCommands } from '../features/sales/salesOrderLineComponent/commands';
import { registerSalesPaymentCommands } from '../features/sales/salesPayment/commands';
import { registerSalesPointCommands } from '../features/sales/salesPoint/commands';
import { registerSalesPricelistCommands } from '../features/sales/salesPricelist/commands';
import { registerSalesPricelistItemCommands } from '../features/sales/salesPricelistItem/commands';
import { registerSalesPromotionConditionGroupCommands } from '../features/sales/salesPromotionConditionGroup/commands';
import { registerSalesPromotionProgramCommands } from '../features/sales/salesPromotionProgram/commands';
import { registerSalesPromotionRewardCommands } from '../features/sales/salesPromotionReward/commands';
import { registerSalesQuotationCommands } from '../features/sales/salesQuotation/commands';
import { registerSalesQuotationLineCommands } from '../features/sales/salesQuotationLine/commands';
import { registerSalesReturnCommands } from '../features/sales/salesReturn/commands';
import { registerSalesVoucherCodeCommands } from '../features/sales/salesVoucherCode/commands';
import { registerSalesVoucherRedemptionCommands } from '../features/sales/salesVoucherRedemption/commands';
import { buildSalesBillPages } from '../pages/sales/salesBill';
import { buildSalesChannelPages } from '../pages/sales/salesChannel';
import { buildSalesComboPages } from '../pages/sales/salesCombo';
import { buildSalesFiscalRequestPages } from '../pages/sales/salesFiscalRequest';
import { buildSalesOrderPages } from '../pages/sales/salesOrder';
import { buildSalesPaymentPages } from '../pages/sales/salesPayment';
import { buildSalesPointPages } from '../pages/sales/salesPoint';
import { buildSalesPricelistPages } from '../pages/sales/salesPricelist';
import { buildSalesPromotionProgramPages } from '../pages/sales/salesPromotionProgram';
import { buildSalesQuotationPages } from '../pages/sales/salesQuotation';
import { buildSalesReturnPages } from '../pages/sales/salesReturn';
import { buildSalesVoucherCodePages } from '../pages/sales/salesVoucherCode';

import type { HostServices } from '@nikkierp/ui/microApp';
import type { PageNode } from '@nikkierp/viewengine/metadata';


/** Everything `sales` contributes to the host when the commerce bundle initialises. */
export function registerSales(host: HostServices): void {
	// No `registerReducer`: this module keeps its state in its own store (`../store/sales`).
	registerModelSchemas();
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
	registerSalesOrderFulfillmentCommands(host.commandBus);
	registerSalesOrderFulfillmentItemCommands(host.commandBus);
	registerSalesManualDiscountCommands(host.commandBus);
	registerSalesBillCommands(host.commandBus);
	registerSalesBillLineCommands(host.commandBus);
	registerSalesBillRelationCommands(host.commandBus);
	registerSalesPaymentCommands(host.commandBus);
	registerSalesFulfillmentRequestCommands(host.commandBus);
	registerSalesFulfillmentRequestLineCommands(host.commandBus);
	registerSalesFiscalRequestCommands(host.commandBus);
	registerSalesReturnCommands(host.commandBus);
}

export function buildSalesPages(): PageNode[] {
	return [
		...buildSalesOrderPages(),
		...buildSalesQuotationPages(),
		...buildSalesBillPages(),
		...buildSalesPaymentPages(),
		...buildSalesFiscalRequestPages(),
		...buildSalesReturnPages(),
		...buildSalesPricelistPages(),
		...buildSalesPromotionProgramPages(),
		...buildSalesComboPages(),
		...buildSalesVoucherCodePages(),
		...buildSalesChannelPages(),
		...buildSalesPointPages(),
	];
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
		// Read-only: a kiosk sale's delivery, created by confirming the order and moved by the
		// attempt and result actions. Its items carry the warehouse reservation each is held by.
		schemaName: c.SALES_ORDER_FULFILLMENT_SCHEMA_NAME,
		resourcePath: c.SALES_ORDER_FULFILLMENT_RESOURCE_PATH,
	}, {
		schemaName: c.SALES_ORDER_FULFILLMENT_ITEM_SCHEMA_NAME,
		resourcePath: c.SALES_ORDER_FULFILLMENT_ITEM_RESOURCE_PATH,
	}, {
		// The refund request. Raised from an order; confirmed, processed and cancelled by its own
		// actions rather than by editing the row.
		schemaName: c.SALES_RETURN_SCHEMA_NAME,
		resourcePath: c.SALES_RETURN_RESOURCE_PATH,
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
