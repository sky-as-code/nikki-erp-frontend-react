import { getFieldDataTypeName } from '../cellValues';

import type { SearchItem } from '../types';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Picking the card's thumbnail without the caller having to say which field holds one.
 *
 * The schema has no image data type — a picture is just a `url` — so the field is chosen by
 * name, from the conventions the backend models already use. A caller that knows better passes
 * `thumbnailField` and skips all of this.
 */
const thumbnailFieldNameHints = [
	'thumbnail', 'thumbnail_url', 'image', 'image_url', 'picture', 'picture_url',
	'photo', 'photo_url', 'avatar', 'avatar_url', 'logo', 'logo_url', 'icon_url',
];

const imageUrlPattern = /\.(png|jpe?g|gif|webp|avif|svg|bmp)(\?|#|$)/i;

/**
 * The field whose value the card shows as its picture, or null when the record has none.
 *
 * A hinted name wins only if the record's value actually looks usable; otherwise any `url`
 * field pointing at an image extension is accepted. Both checks run against the item rather
 * than the schema alone, so a nullable image column does not leave every card with a broken
 * `<img>`.
 */
export function resolveThumbnailField(
	item: SearchItem,
	fields: string[],
	modelSchema?: dyn.ModelSchema,
	declaredField?: string,
): string | null {
	if (declaredField) {
		return isUsableImageValue(item[declaredField]) ? declaredField : null;
	}
	const byName = fields.find(
		field => thumbnailFieldNameHints.includes(field.toLowerCase()) && isUsableImageValue(item[field]),
	);
	if (byName) {
		return byName;
	}
	return fields.find(field => (
		getFieldDataTypeName(modelSchema?.fields?.[field]) === 'url'
		&& isUsableImageValue(item[field])
		&& imageUrlPattern.test(String(item[field]))
	)) ?? null;
}

function isUsableImageValue(value: unknown): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Up to two initials for the placeholder shown when a record has no picture.
 *
 * Falls back to `#` rather than an empty box so every card keeps the same silhouette and the
 * grid does not develop ragged rows where records happen to lack a title.
 */
export function getThumbnailInitials(title: string): string {
	const words = title.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return '#';
	}
	return words.slice(0, 2).map(word => word[0]!.toUpperCase()).join('');
}
