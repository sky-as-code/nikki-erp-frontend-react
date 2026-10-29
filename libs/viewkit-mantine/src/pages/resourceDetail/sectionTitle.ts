import { useSchemaLocalize } from '@nikkierp/ui/i18n';

import { useOptionalResourceDetailContext } from './ResourceDetailProvider';

import type { TranslateFn } from '@nikkierp/ui/i18n';


const GENERAL_INFORMATION_KEY = 'form.generalInformation';

/** `form.generalInformation`, with or without a namespace prefix. */
export function isGeneralInformationKey(header: string | undefined): boolean {
	return header === GENERAL_INFORMATION_KEY || (header?.endsWith(`:${GENERAL_INFORMATION_KEY}`) ?? false);
}

/**
 * The text of a section header: on a resource detail page, create or update alike, the general
 * information section reads `{schema} - General information`, so the page says what record its
 * first block describes. Composed here, once, rather than in each of the pages declaring the key.
 */
export function useSectionTitle(header: string | undefined, t: TranslateFn): string | undefined {
	const detail = useOptionalResourceDetailContext();
	const modelSchema = detail?.schemaPack?.modelSchema;
	const localizeSchema = useSchemaLocalize(detail?.schemaPack?.schemaName ?? '');
	if (header == null) {
		return undefined;
	}
	const section = t(header);
	const schema = modelSchema?.label ? localizeSchema(modelSchema.label) : '';
	if (!isGeneralInformationKey(header) || !schema) {
		return section;
	}
	return t('common:form.sectionTitleWithSchema', { schema, section, defaultValue: '{{schema}} - {{section}}' });
}
