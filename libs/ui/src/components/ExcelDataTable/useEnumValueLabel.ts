import React from 'react';

import { useExcelDataTableContext } from './context';
import { useTranslate } from '../../i18n';


/**
 * The label of an enum value in this table's filters, from the column's renderer: an `enum`
 * renderer declares the translation key of each value. Without one the stored value is shown.
 * Shared by the column filter row and the filter panel, so both name a value the same way.
 */
export function useEnumValueLabel(): (field: string, value: string) => string {
	const { fieldRenderers, translationNs } = useExcelDataTableContext();
	const tField = useTranslate(translationNs);
	return React.useCallback((field: string, value: string) => {
		const renderer = fieldRenderers[field];
		return renderer?.translationKey && value !== '' ? tField(renderer.translationKey(value)) : value;
	}, [fieldRenderers, tField]);
}
