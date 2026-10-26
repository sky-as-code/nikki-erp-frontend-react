import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * A channel's `code` is immutable once set, enforced in the backend domain service rather than the
 * schema: a till names the code when it opens a sale, so changing it orphans every point and order
 * referring to it.
 */
@storeService('SalesChannelService', salesStore)
export class SalesChannelService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_CHANNEL_SCHEMA_NAME });
	}

	/** No new sales; existing ones are unaffected. */
	public suspend(request: ChannelActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.SUSPEND_PATH);
	}

	public activate(request: ChannelActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.ACTIVATE_PATH);
	}

	/** Leaves what was sold through the channel intact. */
	public archive(request: ChannelActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.ARCHIVE_PATH);
	}

	/** How a till turns the code it was configured with into the channel of record. */
	public resolve(request: ResolveChannelRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.RESOLVE_PATH);
	}

	/**
	 * Each entry carries `is_enabled` (this channel's mapping) alongside `is_usable` and
	 * `unusable_reason` from the gateway registry. A method mapped here but absent from the running
	 * build would be offered to a customer and then refused.
	 */
	public paymentMethods(
		request: ChannelActionRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.PAYMENT_METHODS_PATH);
	}

	public enablePaymentMethod(
		request: ChannelPaymentMethodRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.ENABLE_PAYMENT_METHOD_PATH);
	}

	public disablePaymentMethod(
		request: ChannelPaymentMethodRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.DISABLE_PAYMENT_METHOD_PATH);
	}

	private postAction(
		request: Record<string, unknown>, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		// The id goes into the sub-path: manageM2m's primaryResourceId only applies to a
		// resource nested under a parent, so for a top-level resource it is ignored and the
		// post lands on {resource}/{action} with no id - which the backend answers 405.
		const id = request.id as string | undefined;
		const path = id ? `${id}/${action}` : action;
		return this.manageM2m(request as dyn.RestManageM2mRequest, path);
	}
}

export type ChannelActionRequest = {
	id: string,
	etag?: string,
};

/** The code a till was configured with. */
export type ResolveChannelRequest = {
	code: string,
};

export type ChannelPaymentMethodRequest = ChannelActionRequest & {
	payment_method_id: string,
};

export const salesChannelService = new SalesChannelService();
