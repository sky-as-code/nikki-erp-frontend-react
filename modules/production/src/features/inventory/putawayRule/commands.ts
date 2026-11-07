// Proxy copy of the command names in commerce/src/features/inventory/putawayRule/commands.ts, without its
// register function: the commerce micro-app owns the handlers and services, and the command bus
// lazy-loads it on first use.
import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { PUTAWAY_RULE_SCHEMA_NAME } from '../../../constants/inventory';


export const PutawayRuleCommands = Object.freeze(resourceCommands(PUTAWAY_RULE_SCHEMA_NAME));
