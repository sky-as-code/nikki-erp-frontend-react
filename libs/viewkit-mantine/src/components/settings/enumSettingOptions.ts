import { LangJsonRefKey } from '@nikkierp/common/dynamicModel';
import { useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { useSettingsSectionContext } from './settingsContext';

import type { SettingItemData, SettingOption } from './settingsDataContext';


type Translate = (key: string, options: { defaultValue: string }) => string;

/**
 * The declared choices of an enum setting, each labelled `{labelKey}.{value}` in the module's
 * namespace — the convention its langJson follows (`essential.settings.themeMode.light`).
 *
 * The schema declares no per-value label, so the key is derived: first from the field's own
 * `$ref` label, as the backend names it, then from the item's `labelKey`. A value neither
 * translates is shown as stored rather than as a raw key.
 */
export function useEnumSettingOptions(item: SettingItemData, labelKey: string | undefined): SettingOption[] {
	const { translationNs } = useSettingsSectionContext();
	const t = useTranslate(translationNs) as unknown as Translate;
	const enumValues = item.field?.data_type?.options?.enumValues;
	const schemaKey = item.field?.label?.[LangJsonRefKey];
	return React.useMemo(
		() => enumOptionValues(enumValues).map(value => ({
			value, label: enumValueLabel(t, [schemaKey, labelKey], value),
		})),
		[enumValues, schemaKey, labelKey, t],
	);
}

/** The first of `{key}.{value}` that translates, else the value itself. */
export function enumValueLabel(t: Translate, labelKeys: Array<string | undefined>, value: string): string {
	return labelKeys.reduceRight<string>(
		(fallback, key) => (key ? t(`${key}.${value}`, { defaultValue: fallback }) : fallback),
		value,
	);
}

/**
 * `enumValues` is typed `unknown` on the schema, so it is narrowed rather than cast: a declaration
 * that is not a list of strings yields an empty select instead of throwing inside the renderer.
 */
export function enumOptionValues(enumValues: unknown): string[] {
	if (!Array.isArray(enumValues)) return [];
	return enumValues.filter((entry): entry is string => typeof entry === 'string');
}
