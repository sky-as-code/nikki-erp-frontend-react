export type GeneratedVoucher = { id: string, code: string };

/** `generate_batch` answers `{count, vouchers: [{id, code}]}`; anything malformed is dropped, never shown raw. */
export function parseGenerateResult(data: unknown): GeneratedVoucher[] {
	const vouchers = (data as { vouchers?: unknown } | null)?.vouchers;
	if (!Array.isArray(vouchers)) {
		return [];
	}
	return vouchers
		.filter((item): item is GeneratedVoucher => typeof item?.id === 'string' && typeof item?.code === 'string')
		.map(item => ({ id: item.id, code: item.code }));
}

/** One code per line: what a cashier pastes into a mailing or a print run. */
export function generatedCodesText(vouchers: GeneratedVoucher[]): string {
	return vouchers.map(voucher => voucher.code).join('\n');
}

/** The ids "Add all" sends: every current record not yet linked, deduplicated (BR-S02). */
export function idsToAdd(allIds: unknown[], linkedIds: unknown[]): string[] {
	const linked = new Set(linkedIds.filter((id): id is string => typeof id === 'string'));
	const ids = allIds.filter((id): id is string => typeof id === 'string' && id !== '' && !linked.has(id));
	return Array.from(new Set(ids));
}

/** `{base}/new?field_data=…`: the create form of a rule or reward, its promotion already chosen. */
export function childCreateHref(base: string, promotionId: string): string {
	return `${base}/new?field_data=${encodeURIComponent(JSON.stringify({ promotion_id: promotionId }))}`;
}
