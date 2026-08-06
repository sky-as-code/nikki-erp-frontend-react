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
 */
export abstract class StoreCrudServiceBase extends CrudServiceBase {
	@storeAsyncMethod
	public override create(request: dyn.RestCreateRequest): Promise<ServiceResult<dyn.RestCreateResponse>> {
		return super.create(request);
	}

	@storeAsyncMethod
	public override update(request: dyn.RestUpdateRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return super.update(request);
	}

	@storeAsyncMethod
	public override delete(request: DeleteRequest): Promise<ServiceResult<dyn.RestDeleteResponse>> {
		return super.delete(request);
	}

	@storeAsyncMethod
	public override setIsArchived(
		request: dyn.RestSetIsArchivedRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return super.setIsArchived(request);
	}

	@storeAsyncMethod
	public override manageM2m(
		request: dyn.RestManageM2mRequest, path: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return super.manageM2m(request, path);
	}

	@storeAsyncMethod
	public override getById(request: dyn.RestGetByIdRequest): Promise<ServiceResult<dyn.RestGetOneResponse<any>>> {
		return super.getById(request);
	}

	@storeAsyncMethod
	public override getOne<TReq extends dyn.RequestWithFields & Record<string, any>>(
		request: TReq, buildSearchParams: (req: TReq) => URLSearchParams,
	): Promise<ServiceResult<dyn.RestGetOneResponse<any>>> {
		return super.getOne(request, buildSearchParams);
	}

	@storeAsyncMethod
	public override search(request: dyn.RestSearchRequest): Promise<ServiceResult<dyn.RestSearchResponse<any>>> {
		return super.search(request);
	}

	@storeAsyncMethod
	public override exists(request: dyn.RestExistsRequest): Promise<ServiceResult<dyn.RestExistsResponse>> {
		return super.exists(request);
	}

	@storeAsyncMethod
	public override getModelSchema(): Promise<ServiceResult<dyn.RestGetModelSchemaResponse>> {
		return super.getModelSchema();
	}
}
