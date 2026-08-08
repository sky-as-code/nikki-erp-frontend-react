import { CrudServiceBase, DeleteRequest } from '@nikkierp/common/service';

import { storeAsyncMethod } from './methodDecorators';

import type { ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * `CrudServiceBase` with every operation annotated, ready for `@storeService`.
 *
 * The annotations cannot live on `CrudServiceBase` itself: that class is in
 * `@nikkierp/common`, which is framework-free — it has no React, no Redux and a server
 * build with no decorator transform — and `dynamicModel/resourceCommands` instantiates
 * it as the fallback service for schemas no module registered. So the base stays where
 * it is and this subclass, which lives beside the store machinery, carries the metadata.
 *
 * Each method only calls `super`. The override exists solely to own the decorator, since
 * an annotation is recorded against the function object it decorates and the base's
 * functions are undecorated.
 *
 * ```ts
 * @storeService('UserService', identityStore)
 * export class UserService extends StoreCrudServiceBase { }
 * ```
 *
 * A subclass adding its own operations must annotate each one — only annotated methods
 * become part of the slice.
 *
 * ## Nested resources
 *
 * Every operation takes an optional trailing `primaryResourceId`, forwarded to `RestApi`
 * so a schema registered with a `primaryResourcePath` resolves to
 * `{primaryResourcePath}/{primaryResourceId}/{resourcePath}` — e.g.
 * `kiosks/:kioskId/kiosk-stocks`. Omitting it leaves the flat path untouched, so this is
 * transparent to every existing service.
 *
 * Be aware of one consequence: `serviceSlice` dispatches a **multi-argument** call with its
 * params as an **array**, and a single-argument call with the value directly. So
 * `useServiceLayer(svc.search)` is dispatched as `{...}` while a nested
 * `useServiceLayer(svc.search)` called with two args is dispatched as `[{...}, kioskId]`.
 * `exists` is the one exception — see the note on `CrudServiceBase.exists`.
 */
export abstract class StoreCrudServiceBase extends CrudServiceBase {
	@storeAsyncMethod
	public override create(
		request: dyn.RestCreateRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestCreateResponse>> {
		return super.create(request, primaryResourceId);
	}

	@storeAsyncMethod
	public override update(
		request: dyn.RestUpdateRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return super.update(request, primaryResourceId);
	}

	@storeAsyncMethod
	public override delete(
		request: DeleteRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestDeleteResponse>> {
		return super.delete(request, primaryResourceId);
	}

	@storeAsyncMethod
	public override setIsArchived(
		request: dyn.RestSetIsArchivedRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return super.setIsArchived(request, primaryResourceId);
	}

	@storeAsyncMethod
	public override manageM2m(
		request: dyn.RestManageM2mRequest, path: string, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return super.manageM2m(request, path, primaryResourceId);
	}

	@storeAsyncMethod
	public override getById(
		request: dyn.RestGetByIdRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestGetOneResponse<any>>> {
		return super.getById(request, primaryResourceId);
	}

	@storeAsyncMethod
	public override getOne<TReq extends dyn.RequestWithFields & Record<string, any>>(
		request: TReq, buildSearchParams: (req: TReq) => URLSearchParams, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestGetOneResponse<any>>> {
		return super.getOne(request, buildSearchParams, primaryResourceId);
	}

	@storeAsyncMethod
	public override search(
		request: dyn.RestSearchRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestSearchResponse<any>>> {
		return super.search(request, primaryResourceId);
	}

	@storeAsyncMethod
	public override exists(request: dyn.RestExistsRequest): Promise<ServiceResult<dyn.RestExistsResponse>> {
		return super.exists(request);
	}

	@storeAsyncMethod
	public override getModelSchema(
		primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestGetModelSchemaResponse>> {
		return super.getModelSchema(primaryResourceId);
	}
}
