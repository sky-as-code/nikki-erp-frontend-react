import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service/OrgScopedCrudService';
import { ESSENTIAL_MODULE, UOM_SCHEMA_NAME } from '../../constants';
import { essentialStore } from '../../store';


/**
 * CRUD over `essential_uom`.
 *
 * Every operation comes from {@link OrgScopedCrudService}; the resource is served by the
 * backend's dynamic resource engine, so there is nothing resource-specific to add. Archiving is
 * the engine's `set_archived` action, reached through the generic command, not a method here.
 */
@storeService('UomService', essentialStore)
export class UomService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: UOM_SCHEMA_NAME });
	}
}

export const uomService = new UomService();
