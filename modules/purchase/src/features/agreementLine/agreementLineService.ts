import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { AGREEMENT_LINE_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';
import { purchaseStore } from '../../store';


/**
 * CRUD over `purchase_agreement_line`. The engine serves every operation this needs.
 *
 * Reached as a related record of the agreement that owns it.
 *
 * Note the line carries no `ordered_quantity`: how much has been drawn against it is derived on
 * read from the confirmed orders referencing it (§41), never stored. A stored copy would need
 * invalidating from the order side, and the day one path forgot, the agreement would misreport
 * its own drawdown with nothing to reconcile against.
 */
@storeService('AgreementLineService', purchaseStore)
export class AgreementLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PURCHASE_MODULE, schemaName: AGREEMENT_LINE_SCHEMA_NAME });
	}
}

export const agreementLineService = new AgreementLineService();
