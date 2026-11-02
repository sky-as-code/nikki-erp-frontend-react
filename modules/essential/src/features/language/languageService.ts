import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { ESSENTIAL_MODULE, LANGUAGE_SCHEMA_NAME } from '../../constants';
import { essentialStore } from '../../store';


/**
 * CRUD over `essential_language`, the tenant-wide language catalogue. It has no `org_id` column, yet
 * the backend answers per organization (`is_active` is the current org's), so every request names
 * the current org (`orgBound`). Its rules — allowed strftime directives, grouping syntax, distinct
 * separators, at least one active language — are the backend's; a refusal comes back as a field error.
 */
@storeService('LanguageService', essentialStore)
export class LanguageService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: LANGUAGE_SCHEMA_NAME, orgBound: true });
	}
}

export const languageService = new LanguageService();
