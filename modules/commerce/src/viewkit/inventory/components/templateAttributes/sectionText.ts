import { localizedName } from './attributeCatalogue';

import type { AttributeCatalogue, CatalogueValue } from './attributeCatalogue';
import type { ClientErrorItem } from '@nikkierp/common/types';


export const TEST_ID_PREFIX = 'inventory.templateAttributes';

export const MODE_COLORS: Record<string, string> = { instant: 'green', dynamic: 'blue', never: 'gray' };

export type SectionText = {
	t: (key: string, options?: Record<string, unknown>) => string,
	language: string,
	translateError: (item: ClientErrorItem) => string,
};

export function attributeLabel(catalogue: AttributeCatalogue, attributeId: string, text: SectionText): string {
	const attribute = catalogue.attributes.get(attributeId);
	if (!attribute) {
		return attributeId;
	}
	const name = localizedName(attribute.name, text.language, attribute.code);
	return attribute.isArchived ? `${name} ${text.t('product_template_config_archivedSuffix')}` : name;
}

export function valueLabel(value: CatalogueValue, text: SectionText): string {
	const name = localizedName(value.name, text.language, value.code);
	return value.isArchived ? `${name} ${text.t('product_template_config_archivedSuffix')}` : name;
}
