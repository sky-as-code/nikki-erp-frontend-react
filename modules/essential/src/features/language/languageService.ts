import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { ESSENTIAL_MODULE, LANGUAGE_SCHEMA_NAME } from '../../constants';
import { essentialStore } from '../../store';


/**
 * CRUD over `essential_language`, the tenant-wide language catalogue (no `org_id`, so the base
 * class adds no org scope). Its rules — allowed strftime directives, grouping syntax, distinct
 * separators, at least one enabled language — are the backend's; a refusal comes back as a field error.
 */
@storeService('LanguageService', essentialStore)
export class LanguageService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: LANGUAGE_SCHEMA_NAME });
	}
}

export const languageService = new LanguageService();
