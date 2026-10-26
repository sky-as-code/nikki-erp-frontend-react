import { useClientErrorTranslate, useI18n, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { INVENTORY_MODULE } from '../../../../constants/inventory';

import type { SectionText } from './sectionText';


/** The section's translations, in Inventory's namespace with `common` as the fallback. */
export function useSectionText(): SectionText {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const translateError = useClientErrorTranslate([INVENTORY_MODULE, 'common']);
	const language = useI18n().language;
	return React.useMemo(() => ({ t, translateError, language }), [t, translateError, language]);
}
