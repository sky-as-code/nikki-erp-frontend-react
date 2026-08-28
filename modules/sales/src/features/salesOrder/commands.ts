import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import {
	ApplyVoucherRequest, CreateOrderRequest, ManualDiscountRequest, OrderActionRequest,
	ReasonedActionRequest, RevokeManualDiscountRequest, salesOrderService,
} from './salesOrderService';
import { SALES_MODULE, SALES_ORDER_SCHEMA_NAME } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_ORDER_SCHEMA_NAME}`;

/**
 * The CRUD names come from the schema-driven generic path (`core.resource.sales_order.*`), served by
 * the Shell's single prefix subscription — this module subscribes none of them. The eight below are
 * not CRUD, and each carries its own permission on the backend.
 */
export const SalesOrderCommands = Object.freeze({
	...resourceCommands(SALES_ORDER_SCHEMA_NAME),
	CREATE_ORDER: `${PREFIX}.create_order`,
	CONFIRM: `${PREFIX}.confirm`,
	CANCEL: `${PREFIX}.cancel`,
	REPRICE: `${PREFIX}.reprice`,
	APPLY_VOUCHER: `${PREFIX}.apply_voucher`,
	EXPLAIN_PRICE: `${PREFIX}.explain_price`,
	MANUAL_DISCOUNT: `${PREFIX}.manual_discount`,
	REVOKE_MANUAL_DISCOUNT: `${PREFIX}.revoke_manual_discount`,
} as const);

/**
 * Must be called synchronously during the micro-app `init` so lazy command resolution finds the
 * handlers. Returns a teardown function that unsubscribes them all.
 */
export function registerSalesOrderCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_SCHEMA_NAME, salesOrderService);

	const unsubscribers = [
		...lifecycleSubscriptions(bus),
		...pricingSubscriptions(bus),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function lifecycleSubscriptions(bus: ICommandBus): (() => void)[] {
	return [
		bus.subscribe(
			SalesOrderCommands.CREATE_ORDER,
			cmd => salesOrderService.createOrder(createOrderRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderCommands.CONFIRM,
			cmd => salesOrderService.confirm(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderCommands.CANCEL,
			cmd => salesOrderService.cancel(reasonedRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderCommands.REPRICE,
			cmd => salesOrderService.reprice(actionRequest(cmd)),
		),
	];
}

function pricingSubscriptions(bus: ICommandBus): (() => void)[] {
	return [
		bus.subscribe(
			SalesOrderCommands.APPLY_VOUCHER,
			cmd => salesOrderService.applyVoucher(voucherRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderCommands.EXPLAIN_PRICE,
			cmd => salesOrderService.explainPrice(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderCommands.MANUAL_DISCOUNT,
			cmd => salesOrderService.grantManualDiscount(manualDiscountRequest(cmd)),
		),
		bus.subscribe(
			SalesOrderCommands.REVOKE_MANUAL_DISCOUNT,
			cmd => salesOrderService.revokeManualDiscount(revokeRequest(cmd)),
		),
	];
}

/**
 * `etag` is passed through rather than dropped: it is what makes the backend refuse to act on a
 * stale read, so two tills confirming the same order do not both succeed.
 */
function actionRequest(command: Command): OrderActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/**
 * `reason` cannot be collected from a contextual action: a prompt narrows the page's own resource
 * schema to the named fields and drops any the schema does not declare, and `reason` belongs to the
 * transition, not the order. Cancel accepts an empty one, so the action still works.
 */
function reasonedRequest(command: Command): ReasonedActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		reason: String(payload.reason ?? ''),
	};
}

function voucherRequest(command: Command): ApplyVoucherRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		code: String(payload.code ?? ''),
	};
}

/** The line id is omitted rather than sent empty; both mean order-level to the backend. */
function manualDiscountRequest(command: Command): ManualDiscountRequest {
	const payload = command.payload as Record<string, unknown>;
	const lineId = payload.sales_order_line_id;
	return {
		...actionRequest(command),
		sales_order_line_id: lineId == null || lineId === '' ? undefined : String(lineId),
		discount_amount: String(payload.discount_amount ?? ''),
		reason: String(payload.reason ?? ''),
	};
}

function revokeRequest(command: Command): RevokeManualDiscountRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		sales_manual_discount_id: String(payload.sales_manual_discount_id ?? ''),
	};
}

/**
 * Collection-level: it names no existing record. Lines are mapped field by field rather than passed
 * through, so a caller cannot smuggle extra fields onto a line.
 */
function createOrderRequest(command: Command): CreateOrderRequest {
	const payload = command.payload as Record<string, unknown>;
	const lines = Array.isArray(payload.lines) ? payload.lines : [];
	return {
		sales_point_id: String(payload.sales_point_id ?? ''),
		sales_channel_code: optionalString(payload.sales_channel_code),
		customer_reference: optionalString(payload.customer_reference),
		currency_code: optionalString(payload.currency_code),
		external_reference: optionalString(payload.external_reference),
		idempotency_key: optionalString(payload.idempotency_key),
		lines: lines.map(line => {
			const fields = line as Record<string, unknown>;
			return {
				product_variant_id: String(fields.product_variant_id ?? ''),
				uom_id: String(fields.uom_id ?? ''),
				quantity: String(fields.quantity ?? ''),
				unit_price: optionalString(fields.unit_price),
				product_code: optionalString(fields.product_code),
				product_name: optionalString(fields.product_name),
			};
		}),
	};
}

/** Drops a field rather than sending it empty, so "not supplied" stays distinguishable. */
function optionalString(value: unknown): string | undefined {
	return value == null || value === '' ? undefined : String(value);
}
