/**
 * Lifecycle of a scrap document (BR §4.2.9.2).
 *
 * Two states only, and deliberately no cancelled: an unwanted draft is deleted, and a done scrap
 * is corrected by a reverse movement rather than by reopening it.
 */
export type StockScrapStatus = 'draft' | 'done';

/**
 * A document that removes goods from usable stock by moving them to a scrap location.
 *
 * While draft it changes nothing; executing it generates the movement, and that movement is what
 * actually writes the balance down. See BR §4.2.9.
 */
export type StockScrap = {
	id: string,
	scrap_number?: string,
	origin_reference?: string,
	/** The transfer this scrap arose from, when damage was found while processing one. */
	transfer_id?: string,
	product_variant_id?: string,
	base_uom_id?: string,
	lot_ref?: string,
	package_ref?: string,
	owner_ref?: string,
	source_location_id?: string,
	scrap_location_id?: string,
	/** Decimal as a string, so no rounding reaches a balance (BR §7.3). */
	quantity?: string,
	reason_code?: string,
	reason?: string,
	status?: StockScrapStatus,
	/** The movement Do Scrap generated. Empty until the scrap is done. */
	move_id?: string,
	completed_at?: string,
	note?: string,
	org_id?: string,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};
