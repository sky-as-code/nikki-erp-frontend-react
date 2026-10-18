import type { ClientErrorItem } from './common';


/**
 * The subset of i18next's `t` this module relies on, so the package stays free of an i18next
 * dependency. A `useTranslate()` result satisfies it.
 */
export type ClientErrorTranslator = (key: string, options: Record<string, unknown>) => string;

export type TranslatableClientError = Pick<ClientErrorItem, 'key' | 'message' | 'vars'>;

/**
 * Translates a server error from its `key`, interpolating its `vars`, and falls back to the
 * server's already-interpolated `message` when the key is missing from the loaded bundles.
 *
 * A var whose value is itself a translation key (`referenced_by: "iam:iam_role_user_assignments"`)
 * is translated only when the locale message opts in with i18next nesting, `$t({{referenced_by}})`;
 * no var is guessed to be a key here.
 */
export function translateClientError(t: ClientErrorTranslator, item: TranslatableClientError): string {
	if (!item.key) {
		return item.message;
	}
	return t(item.key, { ...flattenVars(item.vars), defaultValue: item.message });
}

function flattenVars(vars: Record<string, unknown> | undefined): Record<string, unknown> {
	if (!vars) {
		return {};
	}
	const flat: Record<string, unknown> = {};
	for (const [name, value] of Object.entries(vars)) {
		flat[name] = Array.isArray(value) ? value.join(', ') : value;
	}
	return flat;
}
