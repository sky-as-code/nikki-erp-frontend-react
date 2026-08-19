import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { purchaseStore } from '../../store';


/**
 * CRUD over `purchase_agreement`, plus the four actions that move it through its lifecycle.
 *
 * `close` and `cancel` are not synonyms and the distinction is the point: a closed agreement ran
 * its course and the orders drawn against it stand, where a cancelled one was called off. Both are
 * terminal, so the button that fires each has to be the right one.
 */
@storeService('AgreementService', purchaseStore)
export class AgreementService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.PURCHASE_MODULE, schemaName: c.AGREEMENT_SCHEMA_NAME });
	}

	/**
	 * Puts the agreement into force.
	 *
	 * The backend refuses an agreement with no lines: a blanket order commits to quantities at
	 * agreed prices, and one with nothing on it commits to nothing while looking as though it does.
	 */
	public confirm(request: AgreementActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CONFIRM_PATH);
	}

	/**
	 * Closes an agreement that has run its course. The orders drawn against it stand.
	 *
	 * Refused while orders raised against it are still open — closing it under them would strand
	 * documents against an agreement no longer in force.
	 */
	public close(request: AgreementActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CLOSE_PATH);
	}

	/**
	 * Calls the agreement off. Terminal, and distinct from closing it.
	 *
	 * The reason is collected because this is the last thing anyone can record about the document:
	 * confirm and close are self-explanatory from the status they produce, but an agreement called
	 * off part-way is not.
	 */
	public cancel(request: ReasonedAgreementRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CANCEL_PATH);
	}

	/**
	 * Draws a new request for quotation from this agreement, copying its vendor, currency and
	 * lines onto a fresh order.
	 *
	 * It carries `drif.PermissionCreate` on the backend rather than a permission of its own: what
	 * it produces is an order, so the right to raise one is what it needs.
	 */
	public createRfq(request: AgreementActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CREATE_RFQ_PATH);
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
 * What an agreement action accepts: the record it acts on and the version it was read at.
 *
 * `etag` is what makes the action refuse to act on a stale read, so two people confirming the same
 * agreement do not both succeed.
 */
export type AgreementActionRequest = {
	id: string,
	etag?: string,
};

/** What `cancel` accepts. The reason is read by the backend and recorded on the audit event. */
export type ReasonedAgreementRequest = AgreementActionRequest & {
	reason: string,
};

export const agreementService = new AgreementService();
