import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import {
	LocationStockRow, ProductUsage, StockByLocationRequest, TemplateStockSummary,
	TemplateSummaryRequest, VariantSummariesRequest, VariantSummaryRequest,
	VariantStockSummary, WarehouseStockRow,
} from './types';
import { INVENTORY_MODULE, STOCK_QUANT_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * The stock reads a product page makes.
 *
 * It sits on the quant resource because that is what the backend actions hang off: what they read
 * is quants, and giving Product its own endpoint would have made Product the owner of a stock
 * query. Product displays these numbers and stores none of them.
 *
 * Everything here reads. The base class contributes write methods, but no page binds one and the
 * server refuses them on this resource anyway — a balance is the running total of completed
 * movements, never something a client sets (CR §6.2, AC-PROD-INT-034).
 */
@storeService('ProductStockService', inventoryStore)
export class ProductStockService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_QUANT_SCHEMA_NAME });
	}

	/** One variant's stock, for a detail page. */
	public getVariantSummary(
		request: VariantSummaryRequest,
	): Promise<ServiceResult<VariantStockSummary>> {
		return this.readAction(request, 'variant_stock_summary');
	}

	/**
	 * A page of variants in one request, keyed by variant id.
	 *
	 * This is the form a listing uses. Calling `getVariantSummary` per row would be the N+1 the
	 * requirement forbids by name (CR §8.4, AC-PROD-INT-035).
	 */
	public getVariantSummaries(
		request: VariantSummariesRequest,
	): Promise<ServiceResult<Record<string, VariantStockSummary>>> {
		return this.readAction(request, 'variant_stock_summaries');
	}

	/**
	 * A template's aggregate with the variant rows behind it.
	 *
	 * The total is the sum of the variants; the template itself holds no stock and never will
	 * (CR §5.2, TS-PROD-02).
	 */
	public getTemplateSummary(
		request: TemplateSummaryRequest,
	): Promise<ServiceResult<TemplateStockSummary>> {
		return this.readAction(request, 'template_stock_summary');
	}

	/** One variant's stock grouped by warehouse (CR §9.1). */
	public getStockByWarehouse(
		request: VariantSummaryRequest,
	): Promise<ServiceResult<WarehouseStockRow[]>> {
		return this.readAction(request, 'stock_by_warehouse');
	}

	/** One variant's stock per location, optionally within one warehouse (CR §9.2). */
	public getStockByLocation(
		request: StockByLocationRequest,
	): Promise<ServiceResult<LocationStockRow[]>> {
		return this.readAction(request, 'stock_by_location');
	}

	/**
	 * What would be stranded if this variant were archived.
	 *
	 * For explaining a refusal before the user attempts it. The archive is guarded on the server
	 * regardless, so skipping this call cannot get an unsafe archive through.
	 */
	public getProductUsage(request: VariantSummaryRequest): Promise<ServiceResult<ProductUsage>> {
		return this.readAction(request, 'product_usage');
	}

	/**
	 * Posts to `{resource}/{action}`.
	 *
	 * These actions take no record id — they are questions about the whole quant set, narrowed by
	 * the body — so the path carries no id segment, unlike StockQuantService.runOperation. It goes
	 * through `manageM2m` for the same reason that one does: it is the only base-class method that
	 * posts to an arbitrary sub-path.
	 */
	private readAction<TRequest, TResponse>(
		request: TRequest, action: string,
	): Promise<ServiceResult<TResponse>> {
		return this.manageM2m(
			request as dyn.RestManageM2mRequest, action,
		) as unknown as Promise<ServiceResult<TResponse>>;
	}
}

export const productStockService = new ProductStockService();
