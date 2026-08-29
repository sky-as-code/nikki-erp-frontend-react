import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * CRUD over `sales_order`, plus the eight lifecycle actions. Each action carries its own backend
 * permission, so a role allowed to correct a customer reference is not thereby allowed to commit the
 * sale. The four status columns are `no_update` in the schema — only these actions move them.
 *
 * `create_order` is collection-level and exists rather than a plain POST because creation derives
 * the stored channel from the sales point, so a till cannot claim a sale happened elsewhere.
 */
@storeService('SalesOrderService', salesStore)
export class SalesOrderService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_SCHEMA_NAME });
	}

	/**
	 * Creates an order with its lines in one call. A duplicate `idempotency_key` returns the original
	 * order successfully rather than a conflict, because a gateway told "conflict" retries forever.
	 */
	public createOrder(request: CreateOrderRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CREATE_ORDER_PATH);
	}

	/**
	 * Validates, reprices, redeems vouchers, then freezes the order.
	 *
	 * Check `pending` in the response before acting on success: confirm reserves stock through
	 * Inventory, and a refusal there does not fail the confirm, so a caller that dispenses on a bare
	 * 200 hands over goods no reservation covers. Re-confirming is refused rather than treated as
	 * idempotent, since a silent second success would redeem the voucher twice.
	 */
	public confirm(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CONFIRM_PATH);
	}

	/** Refused on a paid or fulfilled order; the refusal names the refund or return workflow instead. */
	public cancel(request: ReasonedActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CANCEL_PATH);
	}

	/**
	 * Re-runs the pricing engine and replaces the adjustment chain wholesale — appending would leave
	 * stale links explaining a total that no longer exists. Deliberately not automatic on a line
	 * edit, so adding three lines costs one repricing.
	 */
	public reprice(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.REPRICE_PATH);
	}

	/**
	 * `code` is the printed string, not an id; the backend resolves it. Everything else is derived
	 * from the order rather than accepted from the caller, so a till cannot claim eligibility.
	 */
	public applyVoucher(request: ApplyVoucherRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.APPLY_VOUCHER_PATH);
	}

	/**
	 * Returns how the order's total was reached, adjustment by adjustment. A POST despite being a
	 * read: the explanation is computed from the stored chain, so the engine exposes it as an action.
	 */
	public explainPrice(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.EXPLAIN_PRICE_PATH);
	}

	/**
	 * An empty `sales_order_line_id` means order-level, which the backend spreads proportionally
	 * across the lines. `reason` is required; `granted_by` is deliberately not accepted, since the
	 * actor comes from the request context and a caller must not name someone else as authoriser.
	 */
	public grantManualDiscount(
		request: ManualDiscountRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.MANUAL_DISCOUNT_PATH);
	}

	/** Revokes a manual discount by its own id, not the line's. */
	public revokeManualDiscount(
		request: RevokeManualDiscountRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.REVOKE_MANUAL_DISCOUNT_PATH);
	}

	/**
	 * Goes through `manageM2m` because that is the only base-class method that posts to an arbitrary
	 * sub-path; the name describes its usual caller, not a constraint on the path.
	 *
	 * The id goes into the SUB-PATH, not into `manageM2m`'s `primaryResourceId`. That parameter
	 * only does anything for a resource nested under a parent (`primaryResourcePath`); for a
	 * top-level resource like the order it is ignored, and the post lands on `{resource}/{action}`
	 * with no id. The backend answers that 405 rather than 404, because the collection route exists
	 * for other methods — so the action silently does nothing instead of reporting a failure.
	 */
	private postAction(
		request: Record<string, unknown>, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const id = request.id as string | undefined;
		const path = id ? `${id}/${action}` : action;
		return this.manageM2m(request as dyn.RestManageM2mRequest, path);
	}
}

/**
 * What a plain `:id/{action}` accepts. `etag` is what makes the action refuse a stale read — two
 * tills confirming the same order must not both succeed.
 */
export type OrderActionRequest = {
	id: string,
	etag?: string,
};

/**
 * The reason is optional on the backend and recorded on the audit event when supplied; it is typed
 * as required here so the caller decides explicitly, sending an empty string when it has nothing.
 */
export type ReasonedActionRequest = OrderActionRequest & {
	reason: string,
};

export type ApplyVoucherRequest = OrderActionRequest & {
	code: string,
};

/** An absent line id means order-level. */
export type ManualDiscountRequest = OrderActionRequest & {
	sales_order_line_id?: string,
	discount_amount: string,
	reason: string,
};

export type RevokeManualDiscountRequest = OrderActionRequest & {
	sales_manual_discount_id: string,
};

export type CreateOrderLine = {
	product_variant_id: string,
	uom_id: string,
	quantity: string,
	unit_price?: string,
	product_code?: string,
	product_name?: string,
};

/**
 * `sales_channel_code` is not the channel of record: the backend derives the stored channel from
 * `sales_point_id`, and sending a channel that disagrees with the point's does not override it.
 */
export type CreateOrderRequest = {
	sales_point_id: string,
	sales_channel_code?: string,
	customer_reference?: string,
	currency_code?: string,
	external_reference?: string,
	idempotency_key?: string,
	lines: CreateOrderLine[],
};

export const salesOrderService = new SalesOrderService();
