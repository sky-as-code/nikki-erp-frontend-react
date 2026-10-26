import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import {
	DUPLICATE_TEMPLATE_PATH, GENERATE_VARIANTS_PATH, INVENTORY_MODULE, PREVIEW_ATTRIBUTE_CONFIGURATION_PATH,
	PRODUCT_TEMPLATE_SCHEMA_NAME, RESOLVE_SELECTION_PATH,
} from '../../../constants/inventory';
import { inventoryStore } from '../../../store/inventory';


/**
 * CRUD over `inventory_product_template`, plus the capabilities the engine defines as custom
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
	 * Re-reconciles a template's variants with its saved attribute configuration: creates, extends
	 * and restores what is missing, and deletes or archives what no longer fits.
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
	 * Dry run of a configuration save: what applying these lines and exclusions would do to every
	 * variant. Refused with `err_etag_mismatched` once the template moved past `etag`.
	 */
	@storeAsyncMethod
	public previewAttributeConfiguration(
		request: t.PreviewAttributeConfigurationRequest,
	): Promise<ServiceResult<unknown>> {
		const { id, ...body } = request;
		return this.postAction<unknown>(`${id}/${PREVIEW_ATTRIBUTE_CONFIGURATION_PATH}`, body);
	}

	/**
	 * Duplicates a template with its active configuration and its own copy of the preview image; stock,
	 * history, SKUs and variants are not duplicated.
	 */
	@storeAsyncMethod
	public duplicateTemplate(request: t.DuplicateTemplateRequest): Promise<ServiceResult<t.DuplicateTemplateResponse>> {
		const body = request.name === undefined ? {} : { name: request.name };
		return this.postAction<t.DuplicateTemplateResponse>(`${request.id}/${DUPLICATE_TEMPLATE_PATH}`, body);
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
