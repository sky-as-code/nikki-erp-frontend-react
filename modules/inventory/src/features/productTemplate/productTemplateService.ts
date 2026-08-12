import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import {
	GENERATE_VARIANTS_PATH, INVENTORY_MODULE, PRODUCT_TEMPLATE_SCHEMA_NAME, RESOLVE_SELECTION_PATH,
} from '../../constants';
import { inventoryStore } from '../../store';


/**
 * CRUD over `inventory_product_template`, plus the two capabilities the engine defines as custom
 * actions beyond CRUD.
 *
 * Both are a `POST {resourcePath}/{actionPath}` with a JSON body, which is exactly what
 * `manageM2m` performs — it is named for its most common use, not restricted to it, and
 * `identity/features/roleAssignment.ts` already uses it for a non-m2m nested route. Going through
 * it keeps these calls on the schema-aware path, so the schema-etag refresh still happens.
 */
@storeService('ProductTemplateService', inventoryStore)
export class ProductTemplateService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_TEMPLATE_SCHEMA_NAME });
	}

	/**
	 * Brings a template's variants in step with its INSTANT attribute configuration.
	 *
	 * Obsolete variants come back in the response rather than being deleted: one a transaction
	 * already references must be archived instead, and only the caller knows which. See BR §8.2.
	 */
	@storeAsyncMethod
	public generateVariants(templateId: string): Promise<ServiceResult<t.GenerateVariantsResponse>> {
		return this.postAction<t.GenerateVariantsResponse>(`${templateId}/${GENERATE_VARIANTS_PATH}`, {});
	}

	/**
	 * Turns a template plus chosen attribute values into the concrete variant a transaction line
	 * must reference. See BR §14.4.
	 */
	@storeAsyncMethod
	public resolveSelection(
		request: t.ResolveSelectionRequest,
	): Promise<ServiceResult<t.ResolveSelectionResponse>> {
		return this.postAction<t.ResolveSelectionResponse>(RESOLVE_SELECTION_PATH, request);
	}

	/**
	 * POSTs a JSON body to a custom action of this resource, at `{resourcePath}/{actionPath}`.
	 *
	 * The cast is the one place this is not type-safe: `manageM2m` declares its response as
	 * `RestMutateResponse` because that is what an m2m update returns, while a custom action
	 * returns whatever its own view struct declares. The response shapes are pinned to the
	 * backend views in `./types` — see
	 * backend .../modules/inventory/interfaces/product/views.go.
	 */
	private postAction<TResponse>(
		actionPath: string, body: object,
	): Promise<ServiceResult<TResponse>> {
		const request = body as dyn.RestManageM2mRequest;
		return this.manageM2m(request, actionPath) as unknown as Promise<ServiceResult<TResponse>>;
	}
}

export const productTemplateService = new ProductTemplateService();
