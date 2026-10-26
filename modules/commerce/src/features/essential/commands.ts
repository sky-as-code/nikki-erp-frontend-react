import { resourceCommands } from '@nikkierp/common/dynamicModel';

import { UOMCAT_SCHEMA_NAME, UOM_SCHEMA_NAME } from '../../constants/essential';


/**
 * Command names of the essential resources the proxy pages publish, copied from
 * `nikkierp/modules/essential/src/features/<resource>/commands.ts` without their `register*` functions: the essential
 * micro-app owns the handlers and services, and the command bus lazy-loads it on first use.
 */
export const UomCommands = Object.freeze({
	...resourceCommands(UOM_SCHEMA_NAME),
} as const);

export const UomCatCommands = Object.freeze({
	...resourceCommands(UOMCAT_SCHEMA_NAME),
} as const);
