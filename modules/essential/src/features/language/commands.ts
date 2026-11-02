import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { languageService } from './languageService';
import { ESSENTIAL_MODULE, LANGUAGE_SCHEMA_NAME } from '../../constants';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names for the language catalogue. Every name comes from the generic schema-driven path
 * and the Shell serves them all; the Settings micro-app's proxy pages publish the same names.
 */
export const LanguageCommands = Object.freeze({
	...resourceCommands(LANGUAGE_SCHEMA_NAME),
} as const);

export function registerLanguageCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(LANGUAGE_SCHEMA_NAME, ESSENTIAL_MODULE);
	registerCrudService(LANGUAGE_SCHEMA_NAME, languageService);

	return () => { /* nothing subscribed, so nothing to unsubscribe */ };
}
