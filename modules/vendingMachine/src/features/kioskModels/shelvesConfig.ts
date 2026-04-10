import type { KioskShelfType, ShelvesConfigWire, TrayConfiguration } from './types';


function normalizeShelfType(raw: unknown): KioskShelfType | undefined {
	if (raw == null || raw === '') return undefined;
	return String(raw) as KioskShelfType;
}

/** Parse API / stored shelves_config into tray rows for the UI. Supports legacy `trays`. */
export function shelvesConfigToTrayConfigurations(
	config?: ShelvesConfigWire | Record<string, unknown> | null,
): TrayConfiguration[] {
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

/** Build shelves_config for API: `{ config: [{ row, type }] }`. */
export function trayConfigurationsToShelvesConfig(trays: TrayConfiguration[]): ShelvesConfigWire {
	return {
		config: trays
			.filter((t) => t.row && t.shelfType)
			.map((t) => ({ row: t.row, type: t.shelfType as string })),
	};
}
