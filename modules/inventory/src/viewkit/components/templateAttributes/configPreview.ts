import { localizedName } from './attributeCatalogue';

import type { ExclusionPayload } from './templateConfigDrafts';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type PreviewVariant = {
	variant_id?: string,
	variant_kind: 'base' | 'complete' | string,
	combination_key: string,
	value_ids: string[],
	/** The variant's computed `display_name`: a plain string, or a langjson per language. */
	display_name?: string | dyn.ModelSchemaLangJson,
	sku?: string,
	primary_barcode?: string,
	on_hand_quantity?: string,
	reserved_quantity?: string,
	archive_reason?: string,
	used_by?: string[],
};

export type PreviewCounts = {
	keep: number, extend: number, restore: number, create: number,
	archive: number, delete: number, untouched: number,
};

/** `POST product_template/:id/preview_attribute_configuration`: what applying the draft would do. */
export type ConfigPreview = {
	etag: string,
	counts: PreviewCounts,
	pre_create_kind?: 'base' | 'complete' | string,
	pre_create_count: number,
	possible_complete_count: number | null,
	possible_over_threshold: boolean,
	inactive_exclusions: ExclusionPayload[] | null,
	changes_identity: boolean,
	keep?: PreviewVariant[] | null,
	extend?: PreviewVariant[] | null,
	restore?: PreviewVariant[] | null,
	untouched?: PreviewVariant[] | null,
	create: PreviewVariant[] | null,
	archive: PreviewVariant[] | null,
	delete: PreviewVariant[] | null,
};

/**
 * Whether the user must see the plan before it is applied: a variant changes identity, or one is
 * archived or deleted. Creating new variants alone is what the user just asked for.
 */
export function needsConfirmation(preview: ConfigPreview): boolean {
	return preview.changes_identity
		|| (preview.archive?.length ?? 0) > 0
		|| (preview.delete?.length ?? 0) > 0
		|| preview.counts.archive > 0
		|| preview.counts.delete > 0;
}

/** `Red / M`, by the catalogue's labels; the empty combination is the template's default variant. */
export function combinationLabel(
	valueIds: string[], labelOf: (valueId: string) => string, defaultLabel: string,
): string {
	return valueIds.length === 0 ? defaultLabel : valueIds.map(labelOf).join(' / ');
}

/**
 * The backend's `display_name` when it sent one; the combination built from the catalogue otherwise,
 * so an older backend or an unsaved value still reads as `Red / M`.
 */
export function previewVariantLabel(
	item: PreviewVariant, language: string, fallback: () => string,
): string {
	return localizedName(item.display_name, language, '') || fallback();
}

/** A quantity string the backend sends for a variant; absent and zero both mean nothing is held. */
export function holdsQuantity(quantity: string | undefined): boolean {
	const value = Number(quantity ?? '0');
	return Number.isFinite(value) && value !== 0;
}

/** At most `limit` rows are listed; the rest are summed up as a count. */
export function firstRows<TItem>(items: TItem[] | null | undefined, limit: number): { shown: TItem[], hidden: number } {
	const list = items ?? [];
	return { shown: list.slice(0, limit), hidden: Math.max(0, list.length - limit) };
}
