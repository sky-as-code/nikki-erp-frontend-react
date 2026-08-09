import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service/OrgScopedCrudService';
import { ESSENTIAL_MODULE, UOMCAT_SCHEMA_NAME } from '../../constants';
import { essentialStore } from '../../store';


/**
 * CRUD over `essential_uomcat`.
 *
 * Every operation comes from {@link OrgScopedCrudService}. The one-reference-UoM-per-category
 * invariant is enforced by the backend rather than here: the frontend cannot see the other rows
 * in the category at edit time, so any check here would be advisory at best.
 */
@storeService('UomCatService', essentialStore)
export class UomCatService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: UOMCAT_SCHEMA_NAME });
	}
}

export const uomCatService = new UomCatService();
