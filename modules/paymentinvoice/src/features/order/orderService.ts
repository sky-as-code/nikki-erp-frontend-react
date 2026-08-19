import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { ORDER_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';
import { paymentInvoiceStore } from '../../store';


/**
 * CRUD over `paymentinvoice_order`, plus the two operations that move money.
 *
 * Neither of those is a CRUD verb. Taking a payment creates an order *and* asks a gateway to start
 * collecting; refunding one hands money back. The backend exposes each as its own engine action
 * with its own permission, so that a role permitted to correct an order's description is not
 * thereby permitted to hand money back.
 *
 * Note both are collection-level rather than `:id/...`: `create_payment` has no order to name yet,
 * and `refund` identifies its order by the business `order_id` in the body — the identifier the
 * ordering system holds — rather than by this module's primary key.
 */
@storeService('OrderService', paymentInvoiceStore)
export class OrderService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PAYMENTINVOICE_MODULE, schemaName: ORDER_SCHEMA_NAME });
	}

	/**
	 * Records an order and asks its gateway for the payment instrument — a QR code, a pay URL, or
	 * a prompt pushed to a card terminal.
	 *
	 * A deployment with the named gateway disabled refuses this as a client error rather than a
	 * server failure, so the caller is told the method is unavailable rather than being left
	 * unsure whether the payment went through.
	 */
	public createPayment(
		request: CreatePaymentRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, 'create_payment');
	}

	/** Hands money back for an order already paid. */
	public refund(request: RefundRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, 'refund');
	}

	/**
	 * Posts to `{resource}/{action}`.
	 *
	 * It goes through manageM2m because that is the only base-class method that posts to an
	 * arbitrary sub-path; the name is about its usual caller, not a constraint on the path.
	 */
	private postAction(
		request: Record<string, unknown>, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.manageM2m(request as dyn.RestManageM2mRequest, action);
	}
}

/**
 * What `create_payment` accepts. The action declares no `ParamSchema` on the backend — its params
 * mix order fields with method-specific input that no single schema describes — so the shape is
 * documented here rather than derived from one.
 */
export type CreatePaymentRequest = {
	payment_method_id: string,

	/**
	 * Sent as a string so the exact figure survives JSON. A float64 cannot hold every decimal, and
	 * an amount rounded in transit collects something other than what was asked for.
	 */
	amount: string,

	source?: string,
	content?: string,
	return_url?: string,

	/** Whatever the paying method needs at order time — `pos_id` for a card terminal, nothing for
	 * a wallet. Each adapter owns its own keys. */
	metadata?: Record<string, unknown>,
	org_id?: string,
};

/** What `refund` accepts. `order_id` is the business identifier, not the primary key. */
export type RefundRequest = {
	order_id: string,
	amount: string,
	content?: string,
};

export const orderService = new OrderService();
