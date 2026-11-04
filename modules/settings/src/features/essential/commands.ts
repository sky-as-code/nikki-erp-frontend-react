import { resourceCommands } from '@nikkierp/common/dynamicModel';

import {
	CURRENCY_SCHEMA_NAME, ESSENTIAL_MODULE, LANGUAGE_SCHEMA_NAME, SEQUENCE_COUNTER_SCHEMA_NAME,
	SEQUENCE_DEFINITION_SCHEMA_NAME, SEQUENCE_ISSUANCE_SCHEMA_NAME,
} from '../../constants/essential';


/**
 * Command names of the essential resources the proxy pages publish, copied from
 * `nikkierp/modules/essential/src/features/<resource>/commands.ts` without their `register*` functions: the essential
 * micro-app owns the handlers and services, and the command bus lazy-loads it on first use.
 */
export const LanguageCommands = Object.freeze({
	...resourceCommands(LANGUAGE_SCHEMA_NAME),
} as const);

export const CurrencyCommands = Object.freeze({
	...resourceCommands(CURRENCY_SCHEMA_NAME),
} as const);

/** `PREVIEW` is essential's own handler: publishing it lazy-loads the essential micro-app. */
export const SequenceDefinitionCommands = Object.freeze({
	...resourceCommands(SEQUENCE_DEFINITION_SCHEMA_NAME),
	PREVIEW: `${ESSENTIAL_MODULE}.${SEQUENCE_DEFINITION_SCHEMA_NAME}.preview`,
} as const);

export const SequenceCounterCommands = Object.freeze({
	...resourceCommands(SEQUENCE_COUNTER_SCHEMA_NAME),
} as const);

export const SequenceIssuanceCommands = Object.freeze({
	...resourceCommands(SEQUENCE_ISSUANCE_SCHEMA_NAME),
} as const);
