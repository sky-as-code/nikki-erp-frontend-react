import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * One engine serves automatic, conditional and voucher-activated programs: the activation type is
 * data, not three implementations. `stack_policy` and `exclusive_group` decide what may combine
 * with what; an empty group is not a group.
 */
@storeService('SalesPromotionProgramService', salesStore)
export class SalesPromotionProgramService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_PROGRAM_SCHEMA_NAME });
	}
}

export const salesPromotionProgramService = new SalesPromotionProgramService();
