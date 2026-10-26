import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { AUDIT_EVENT_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';
import { purchaseStore } from '../../store';


/**
 * CRUD over `purchase_audit_event`. The engine serves every operation this needs.
 *
 * Read-only in practice (PUR-R6): an event is written by the backend inside the same transaction
 * as the transition it records, and a client write is REFUSED. Only the search and read commands
 * are ever used — the create this base class also exposes would be rejected by the server.
 */
@storeService('AuditEventService', purchaseStore)
export class AuditEventService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PURCHASE_MODULE, schemaName: AUDIT_EVENT_SCHEMA_NAME });
	}
}

export const auditEventService = new AuditEventService();
