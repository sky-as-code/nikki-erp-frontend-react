import { Command, ICommandBus } from '@nikkierp/common/commandBus';

import { productStockService } from './productStockService';
import {
	StockByLocationRequest, TemplateSummaryRequest, VariantSummariesRequest, VariantSummaryRequest,
} from './types';
import { INVENTORY_MODULE, STOCK_QUANT_SCHEMA_NAME } from '../../constants';


const PREFIX = `${INVENTORY_MODULE}.${STOCK_QUANT_SCHEMA_NAME}`;

/**
 * The stock reads a product page makes.
 *
 * They are named under the quant resource because that is the resource they read and the engine
 * they are served by. No CRUD names are generated here: `registerCrudService` for this schema
 * already happens in the stock balance feature, and registering it twice would install a second
 * service for one resource.
 */
export const ProductStockCommands = Object.freeze({
	VARIANT_SUMMARY: `${PREFIX}.variant_stock_summary`,
	VARIANT_SUMMARIES: `${PREFIX}.variant_stock_summaries`,
	TEMPLATE_SUMMARY: `${PREFIX}.template_stock_summary`,
	STOCK_BY_WAREHOUSE: `${PREFIX}.stock_by_warehouse`,
	STOCK_BY_LOCATION: `${PREFIX}.stock_by_location`,
	PRODUCT_USAGE: `${PREFIX}.product_usage`,
} as const);

/**
 * Subscribes the six read handlers. Called synchronously during the micro-app `init` so lazy
 * command resolution finds them. Returns a function that unsubscribes every handler.
 */
export function registerProductStockCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(
			ProductStockCommands.VARIANT_SUMMARY,
			cmd => productStockService.getVariantSummary(payload<VariantSummaryRequest>(cmd)),
		),
		bus.subscribe(
			ProductStockCommands.VARIANT_SUMMARIES,
			cmd => productStockService.getVariantSummaries(payload<VariantSummariesRequest>(cmd)),
		),
		bus.subscribe(
			ProductStockCommands.TEMPLATE_SUMMARY,
			cmd => productStockService.getTemplateSummary(payload<TemplateSummaryRequest>(cmd)),
		),
		bus.subscribe(
			ProductStockCommands.STOCK_BY_WAREHOUSE,
			cmd => productStockService.getStockByWarehouse(payload<VariantSummaryRequest>(cmd)),
		),
		bus.subscribe(
			ProductStockCommands.STOCK_BY_LOCATION,
			cmd => productStockService.getStockByLocation(payload<StockByLocationRequest>(cmd)),
		),
		bus.subscribe(
			ProductStockCommands.PRODUCT_USAGE,
			cmd => productStockService.getProductUsage(payload<VariantSummaryRequest>(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TRequest>(command: Command): TRequest {
	return command.payload as TRequest;
}
