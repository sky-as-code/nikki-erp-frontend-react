import { clientFail, ServiceResult } from '@nikkierp/common/commandBus';
import { EventBus } from '@nikkierp/common/eventBus';
import { getCurrentOrgId } from '@nikkierp/common/service';
import { ClientErrorItem } from '@nikkierp/common/types';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { IAM_MODULE, ORGANIZATION_SCHEMA_NAME, SHELL_USER_ORGS_CHANGED_EVENT } from '../../constants';
import { identityStore } from '../../store';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { DeleteRequest } from '@nikkierp/common/service';


/** Refused before any request: the user is working in this org. Translated by the iam namespace. */
const ERR_DELETE_CURRENT_ORG = 'iam:err_cannot_delete_current_org';

/** CRUD over `iam_org`, plus slug lookup and the members action `iam_org/:id/manage_users`. */
@storeService('OrgService', identityStore)
export class OrgService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: ORGANIZATION_SCHEMA_NAME });
	}

	/** A new org is not listed until it is ready, so the switch is told then: see {@link reportOrgStatus}. */
	@storeAsyncMethod
	public override async create(
		request: dyn.RestCreateRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestCreateResponse>> {
		const result = await super.create(request, primaryResourceId);
		if (result.clientErrors.length === 0 && result.data?.id) {
			awaitingReady.add(result.data.id);
		}
		return result;
	}

	@storeAsyncMethod
	public override async update(
		request: dyn.RestUpdateRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return publishOrgsChangedOnSuccess(await super.update(request, primaryResourceId));
	}

	@storeAsyncMethod
	public override async setIsArchived(
		request: dyn.RestSetIsArchivedRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return publishOrgsChangedOnSuccess(await super.setIsArchived(request, primaryResourceId));
	}

	/**
	 * Deletes every requested org except the one the user is working in: deleting it would pull the
	 * ground from under the session. That one is refused with a client error, which both the list
	 * and the detail page show as a Shell Notice; the others still go.
	 */
	@storeAsyncMethod
	public override async delete(
		request: DeleteRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestDeleteResponse>> {
		const ids = 'ids' in request ? request.ids : [request.id];
		const { deletable, refusesCurrent } = splitDeletableOrgs(ids, await getCurrentOrgId());
		const refusals = refusesCurrent ? [currentOrgRefusal()] : [];

		if (deletable.length === 0) {
			return clientFail(refusals);
		}
		const result = await super.delete({ ids: deletable }, primaryResourceId);
		if (result.data && result.data.affected_count > 0) {
			publishOrgsChanged();
		}
		return { ...result, clientErrors: [...refusals, ...result.clientErrors] };
	}

	@storeAsyncMethod
	public getBySlug(request: t.GetOrgBySlugRequest): Promise<ServiceResult<t.GetOrgResponse>> {
		return this.getOne(request, req => new URLSearchParams({ slug: req.slug }));
	}

	@storeAsyncMethod
	public manageUsers(request: t.ManageOrgUsersRequest): Promise<ServiceResult<t.ManageOrgUsersResponse>> {
		const { id, ...body } = request;
		return this.manageM2m(body, `${encodeURIComponent(id)}/manage_users`);
	}
}

/** Separates the org the user is working in from the ones a delete may remove. */
export function splitDeletableOrgs(
	ids: string[], currentOrgId: string | null,
): { deletable: string[], refusesCurrent: boolean } {
	const deletable = ids.filter(id => id !== currentOrgId);
	return { deletable, refusesCurrent: deletable.length < ids.length };
}

/** Orgs created in this session that the switch has not been told about yet. */
const awaitingReady = new Set<string>();

/**
 * Tells the switch about an org created here once it is seen ready. Setting an org up can finish
 * before its page first loads, so the first sighting counts, not only a change seen while polling.
 */
export function reportOrgStatus(orgId: string | undefined, status: string | undefined): void {
	if (orgId && status === 'ready' && awaitingReady.delete(orgId)) {
		publishOrgsChanged();
	}
}

/** Tells the Shell's Org Switch to refetch its list. */
export function publishOrgsChanged(): void {
	EventBus.instance?.publish(SHELL_USER_ORGS_CHANGED_EVENT, {});
}

function publishOrgsChangedOnSuccess<TData>(result: ServiceResult<TData>): ServiceResult<TData> {
	if (result.clientErrors.length === 0) {
		publishOrgsChanged();
	}
	return result;
}

function currentOrgRefusal(): ClientErrorItem {
	return new ClientErrorItem({
		key: ERR_DELETE_CURRENT_ORG,
		message: 'You cannot delete the organization you are working in. Switch to another one first.',
		type: 'business',
		field: 'id',
	});
}

export const orgService = new OrgService();
