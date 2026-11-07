// Proxy copy of the command names in commerce/src/features/inventory/stockQuant/commands.ts, without its
// register function: the commerce micro-app owns the handlers and services, and the command bus
// lazy-loads it on first use.
import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { INVENTORY_MODULE, STOCK_QUANT_SCHEMA_NAME } from '../../../constants/inventory';


const PREFIX = `${INVENTORY_MODULE}.${STOCK_QUANT_SCHEMA_NAME}`;

export const StockQuantCommands = Object.freeze({
	...resourceCommands(STOCK_QUANT_SCHEMA_NAME),
	ENTER_COUNT: `${PREFIX}.enter_count`,
	RESET_COUNT: `${PREFIX}.reset_count`,
	APPLY_ADJUSTMENT: `${PREFIX}.apply_adjustment`,
	SCHEDULE_COUNT: `${PREFIX}.schedule_count`,
	ASSIGN_COUNTER: `${PREFIX}.assign_counter`,
} as const);
