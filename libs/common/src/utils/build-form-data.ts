import { camelToSnakeCase } from './string';

/**
 * Builds a FormData from a plain object, converting camelCase keys to snake_case.
 * - Skips fields whose values are `null`, `undefined`, or `''`
 * - File/Blob fields are appended with their original filename
 * - All other values are stringified
 *
 * @example
 * const fd = buildFormData({
 *   firstName: 'Alice',
 *   avatar: fileObject,          // File -> appended as multipart
 *   coverImage: 'https://...',  // string -> appended as-is
 *   age: 25,                    // number -> converted to string
 *   deletedAt: null,            // skipped
 * });
 */
export function buildFormData<T extends object>(body: T): FormData {
	const formData = new FormData();
	for (const [rawKey, rawValue] of Object.entries(body)) {
		if (rawValue == null || rawValue === '') {
			continue;
		}
		const key = camelToSnakeCase(rawKey);
		if (rawValue instanceof File) {
			formData.append(key, rawValue, rawValue.name);
		}
		else if (rawValue instanceof Blob) {
			formData.append(key, rawValue);
		}
		else {
			formData.append(key, String(rawValue));
		}
	}
	return formData;
}
