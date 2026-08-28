import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { purchaseStore } from '../../store';


/**
 * CRUD over `purchase_order`, plus the ten actions that move it through its lifecycle.
 *
 * None of them is a CRUD verb, and each carries its own permission on the backend, so that a role
 * permitted to correct an order's description is not thereby permitted to commit the business to
 * the purchase. Confirming, approving and cancelling all write an audit event in the same
 * transaction as the transition itself ([PUR-015]).
 *
 * `merge` is the one collection-level action: it takes several orders and has no single one to
 * name in its path. Everything else is `:id/{action}`.
 */
@storeService('PurchaseOrderService', purchaseStore)
export class PurchaseOrderService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.PURCHASE_MODULE, schemaName: c.PURCHASE_ORDER_SCHEMA_NAME });
	}

	/**
	 * Turns a quotation into a committed purchase order, or routes it for approval when the
	 * organization's configuration demands one.
	 *
	 * The outcome therefore depends on configuration rather than on the caller: with a two-step
	 * mode and a total at or above the threshold the order lands on `to_approve`, not
	 * `purchase_order`. When the order is one of several alternatives, the backend refuses until
	 * `alternative_choice` says what to do with its siblings (§28).
	 */
	public confirm(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CONFIRM_PATH);
	}

	/** Approves an order that confirmation routed for approval. */
	public approve(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.APPROVE_PATH);
	}

	/**
	 * Cancels the order. Terminal: BR 23 permits no route back out of `cancelled`.
	 *
	 * The reason is OPTIONAL here, unlike on unlock — the requirement does not ask for one, and a
	 * mandatory free-text field mostly produces the word "cancelled". It is recorded on the audit
	 * event when supplied.
	 */
	public cancel(request: ReasonedActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CANCEL_PATH);
	}

	/** Marks the quotation as sent to the vendor. */
	public send(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.SEND_PATH);
	}

	/** Locks a confirmed order against further edits. */
	public lock(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.LOCK_PATH);
	}

	/**
	 * Reopens a locked order for editing. The reason is required by the backend, not optional
	 * politeness: unlocking a committed order is the point at which someone changes terms already
	 * agreed with a vendor, and the audit event is the only record of why.
	 */
	public unlock(request: ReasonedActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.UNLOCK_PATH);
	}

	/** Records that the vendor acknowledged the order. */
	public acknowledge(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.ACKNOWLEDGE_PATH);
	}

	/**
	 * Re-resolves the order's line prices from the vendor's current price list (section 30).
	 *
	 * It takes only the order id. WHICH prices apply is the backend resolver's answer, and letting
	 * a caller pass one in would make this an override with extra steps rather than a repricing.
	 *
	 * Refused on a confirmed order, deliberately: the vendor holds a copy of that document, and
	 * moving its prices afterwards would make the two disagree. The operation exists precisely
	 * BECAUSE a vendor price change must never rewrite an order by itself.
	 */
	public reprice(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.REPRICE_PATH);
	}

	/** Copies the order and its lines into a fresh quotation. */
	public duplicate(request: OrderActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.DUPLICATE_PATH);
	}

	/**
	 * Merges several compatible orders into one.
	 *
	 * Collection-level, because there is no single order to name in the path: the backend picks
	 * the target itself — the oldest by deadline — rather than taking the caller's word for it.
	 */
	public merge(request: MergeOrdersRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.MERGE_PATH);
	}

	/**
	 * Opens a competing quotation for the same requirement, in this order's sourcing group.
	 *
	 * The vendor is the point: an alternative is the same requirement quoted by somebody else, so
	 * `vendor_id` names who, and the backend copies the rest of the order across.
	 */
	public createAlternative(
		request: CreateAlternativeRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CREATE_ALTERNATIVE_PATH);
	}

	/**
	 * Compares the open alternatives in this order's sourcing group.
	 *
	 * Read-only despite being a POST: the backend exposes it as an engine action rather than a
	 * search because the comparison is computed, not stored.
	 */
	public compareAlternatives(
		request: OrderActionRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.COMPARE_ALTERNATIVES_PATH);
	}

	/**
	 * Posts to `{resource}/{sub-path}`.
	 *
	 * It goes through `manageM2m` because that is the only base-class method that posts to an
	 * arbitrary sub-path; the name is about its usual caller, not a constraint on the path.
	 */
	private postAction(
		request: Record<string, unknown>, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.manageM2m(request as dyn.RestManageM2mRequest, action);
	}
}

/**
 * What a plain `:id/{action}` accepts: the record it acts on and the version it was read at.
 *
 * `etag` is what makes the action refuse to act on a stale read — two people confirming the same
 * quotation should not both succeed.
 */
export type OrderActionRequest = {
	id: string,
	etag?: string,

	/**
	 * Confirm only. Says what to do with this order's open alternatives — `keep` leaves them, and
	 * `cancel` closes them out. The backend refuses a confirm that omits it when the order has
	 * siblings, so it is sent whenever the page collected one.
	 */
	alternative_choice?: string,
};

/**
 * What `cancel` and `unlock` accept.
 *
 * The reason is REQUIRED by the backend on unlock and optional on cancel. It is typed as required
 * here for both, because the caller has to decide what to send either way, and a caller that has
 * nothing to say sends an empty string rather than omitting the field.
 */
export type ReasonedActionRequest = OrderActionRequest & {
	reason: string,
};

/** What `create_alternative` accepts: the order to compete with, and the vendor to quote. */
export type CreateAlternativeRequest = OrderActionRequest & {
	vendor_id: string,
};

/** What `merge` accepts. The backend chooses the target among them; the caller does not name it. */
export type MergeOrdersRequest = {
	order_ids: string[],
};

export const purchaseOrderService = new PurchaseOrderService();
