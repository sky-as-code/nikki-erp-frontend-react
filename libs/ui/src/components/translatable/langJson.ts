import { LangJsonRefKey } from '@nikkierp/common/dynamicModel';

import type { ModelSchemaLangJson } from '@nikkierp/common/dynamicModel';


/**
 * The language a LangJSON value falls back to when it has no text in the active one. The client
 * has no tenant default language (i18n deliberately declares no `fallbackLng`), so the platform
 * default is the one language every schema label is guaranteed to carry.
 */
export const SYSTEM_DEFAULT_LANGUAGE = 'en-US';

/** Translates a `$ref` key; undefined (or `''`) when it has no translation, so resolution falls through. */
export type LangJsonRefTranslator = (key: string) => string | undefined;

/**
 * A LangJSON value as text: `$ref` translation → active language → `en-US` → first non-empty
 * text → `''`. The last step keeps a record holding only a language the UI is not showing
 * readable, since a label in the wrong language still names it better than nothing does.
 */
export function resolveLangJson(
	langJson: ModelSchemaLangJson | null | undefined,
	language: string | undefined,
	translateRef?: LangJsonRefTranslator,
): string {
	if (!langJson) {
		return '';
	}
	const refKey = langJson[LangJsonRefKey];
	const translated = refKey ? translateRef?.(refKey) : undefined;
	if (translated) {
		return translated;
	}
	const preferred = (language ? langJson[language] : undefined) || langJson[SYSTEM_DEFAULT_LANGUAGE];
	if (preferred) {
		return preferred;
	}
	return Object.entries(langJson).find(([key, text]) => key !== LangJsonRefKey && Boolean(text))?.[1] ?? '';
}

/** Language codes in code order — the order the translation modal lists and fills them in. */
export function sortLanguageCodes(codes: readonly string[]): string[] {
	// Code-unit order on purpose: a locale-aware sort would reorder the list with the UI language.
	return [...codes].sort();
}

/**
 * Gives every empty language of `codes` the text of the nearest filled language before it in code
 * order, else the nearest after it. A `$ref` value or one with no text at all is returned as is:
 * there is nothing to copy from, and a translation key is not a text.
 */
export function fillFromNeighbours(langJson: ModelSchemaLangJson, codes: readonly string[]): ModelSchemaLangJson {
	if (langJson[LangJsonRefKey]) {
		return langJson;
	}
	const sorted = sortLanguageCodes(codes);
	const texts = sorted.map(code => (langJson[code]?.trim() ? langJson[code] : ''));
	if (texts.every(text => !text)) {
		return langJson;
	}
	const result: ModelSchemaLangJson = { ...langJson };
	sorted.forEach((code, index) => {
		if (!texts[index]) {
			result[code] = nearestText(texts, index);
		}
	});
	return result;
}

function nearestText(texts: string[], index: number): string {
	for (let i = index - 1; i >= 0; i--) {
		if (texts[i]) {
			return texts[i];
		}
	}
	return texts.slice(index + 1).find(Boolean) ?? '';
}

/**
 * Fills the other languages from the current one. A language follows the current one while it is
 * empty or still holds what the current language held before this edit (`previousValue`), so typing
 * "Navy" keystroke by keystroke mirrors "Navy" rather than freezing the first letter; a language the
 * user translated differently is never touched.
 */
export function propagateCurrentLangToEmpty(
	langJson: ModelSchemaLangJson,
	currentLng: string,
	supportedLngs: readonly string[],
	previousValue?: string,
): ModelSchemaLangJson {
	const currentValue = langJson[currentLng] ?? '';
	const result = { ...langJson, [currentLng]: currentValue };
	for (const lng of supportedLngs) {
		if (lng === currentLng) {
			continue;
		}
		const other = result[lng] ?? '';
		if (!other.trim() || (previousValue !== undefined && previousValue !== '' && other === previousValue)) {
			result[lng] = currentValue;
		}
	}
	return result;
}
