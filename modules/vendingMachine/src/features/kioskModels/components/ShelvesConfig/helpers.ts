import type { KioskShelfType, ShelvesConfigRow, ShelvesConfigWire } from '@/features/kioskModels/types';


function normalizeShelfType(raw: unknown): KioskShelfType | undefined {
	if (raw == null || raw === '') return undefined;
	return String(raw) as KioskShelfType;
}

/** Đọc JSON shelves_config (hoặc legacy `trays`) thành danh sách dòng cho UI. */
export function parseShelvesConfigRows(
	config?: ShelvesConfigWire | Record<string, unknown> | null,
): ShelvesConfigRow[] {
	if (!config) return [];
	const c = config as { config?: unknown; trays?: unknown };
	const arr = Array.isArray(c.config)
		? c.config
		: Array.isArray(c.trays)
			? c.trays
			: [];
	return arr
		.map((item: { row?: unknown; type?: unknown; shelfType?: unknown }) => ({
			row: String(item.row ?? ''),
			shelfType: normalizeShelfType(item.type ?? item.shelfType),
		}))
		.filter((x) => x.row.length > 0);
}

/** Chuẩn bị payload `shelves_config` cho API: `{ config: [{ row, type }] }`. */
export function buildShelvesConfigWire(rows: ShelvesConfigRow[]): ShelvesConfigWire {
	return {
		config: rows
			.filter((r) => r.row && r.shelfType)
			.map((r) => ({ row: r.row, type: r.shelfType as string })),
	};
}
