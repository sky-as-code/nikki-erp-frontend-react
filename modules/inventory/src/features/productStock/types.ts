/**
 * The stock figures a product page displays.
 *
 * Product owns none of this. The numbers come from Stock on each read and are never stored against
 * a product, which is why there is no create or update shape here — only what comes back.
 *
 * Quantities are strings because they are decimals on the server. Parsing them into `number` would
 * hand them to a float64 and reintroduce exactly the rounding the backend takes care to avoid, so
 * they stay as text all the way to the screen.
 */

export type VariantStockSummary = {
	productVariantId?: string,
	onHand: string,
	reserved: string,
	available: string,
	forecasted: string,
	inTransit: string,
	locationCount: number,
	warehouseCount: number,
	baseUomId?: string,
	lastMovementAt?: string,

	/** Set when the totals are partial, so the page can say so rather than imply completeness. */
	truncated?: boolean,
};

export type TemplateVariantStockRow = {
	productVariantId: string,
	sku?: string,
	combinationKey?: string,
	onHand: string,
	reserved: string,
	available: string,
	forecasted: string,
	inTransit: string,
};

export type TemplateStockSummary = {
	summary: VariantStockSummary,
	variants: TemplateVariantStockRow[],
};

export type WarehouseStockRow = {
	/** Absent for stock outside any warehouse: vendor, customer, transit and loss locations. */
	warehouseId?: string,
	warehouseCode?: string,
	warehouseName?: string,

	/** Carried so a suspended warehouse can be badged rather than hidden. */
	warehouseStatus?: string,

	onHand: string,
	reserved: string,
	available: string,
};

export type LocationStockRow = {
	locationId: string,
	locationCode?: string,
	locationName?: string,

	/** Carried so a suspended location can be badged rather than hidden (TS-PROD-05). */
	locationStatus?: string,
	warehouseId?: string,

	onHand: string,
	reserved: string,
	available: string,
};

/** What would be stranded if a variant were archived now, plus the reader's own verdict. */
export type ProductUsage = {
	onHandQuantity: string,
	reservedQuantity: string,
	openMoveCount: number,
	openTransferCount: number,
	canArchive: boolean,
};

export type VariantSummariesRequest = {
	product_variant_ids: string[],
};

export type VariantSummaryRequest = {
	product_variant_id: string,
};

export type TemplateSummaryRequest = {
	product_template_id: string,
};

export type StockByLocationRequest = {
	product_variant_id: string,

	/** Narrows to one warehouse, for the drill-down out of the by-warehouse rollup. */
	warehouse_id?: string,
};
