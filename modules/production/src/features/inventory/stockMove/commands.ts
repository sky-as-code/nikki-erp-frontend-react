// Proxy copy of the command names in commerce/src/features/inventory/stockMove/commands.ts, without its
// register function: the commerce micro-app owns the handlers and services, and the command bus
// lazy-loads it on first use.
import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { STOCK_MOVE_SCHEMA_NAME } from '../../../constants/inventory';


export const StockMoveCommands = Object.freeze(resourceCommands(STOCK_MOVE_SCHEMA_NAME));
