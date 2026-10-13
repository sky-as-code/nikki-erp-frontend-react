import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { ESSENTIAL_MODULE, UOMCAT_SCHEMA_NAME } from '../../constants';
import { essentialStore } from '../../store';


/**
 * CRUD over `essential_uomcat`.
 *
 * Every operation comes from {@link StoreCrudServiceBase}. The one-reference-UoM-per-category
 * invariant is enforced by the backend rather than here: the frontend cannot see the other rows
 * in the category at edit time, so any check here would be advisory at best.
 */
@storeService('UomCatService', essentialStore)
export class UomCatService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: UOMCAT_SCHEMA_NAME });
	}
}

export const uomCatService = new UomCatService();
