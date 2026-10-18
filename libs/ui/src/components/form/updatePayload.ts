/** Blank the way the form schema's optional rule sees it: nothing, `''` or an empty list. */
export function isClearedValue(value: unknown): boolean {
	return value == null || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * What a partial update sends for a dirty field: its parsed value, or `null` when the user cleared
 * it — the form schema turns a blank optional value into `undefined` and drops the key, so without
 * this a cleared select or text box would silently keep its old value on the server. `undefined`
 * means leave the field out (dirty, yet not in the parsed data for some other reason).
 */
export function dirtyFieldUpdateValue(
	data: Record<string, unknown>, rawValues: Record<string, unknown> | undefined, field: string,
): unknown {
	if (field in data && data[field] !== undefined) {
		return data[field];
	}
	return rawValues && isClearedValue(rawValues[field]) ? null : undefined;
}
