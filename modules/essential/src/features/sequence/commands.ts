import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { sequenceCounterService, sequenceDefinitionService, sequenceIssuanceService } from './sequenceServices';
import {
	ESSENTIAL_MODULE, SEQUENCE_COUNTER_SCHEMA_NAME, SEQUENCE_DEFINITION_SCHEMA_NAME, SEQUENCE_ISSUANCE_SCHEMA_NAME,
} from '../../constants';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names of the Sequence resources. The CRUD names come from the generic schema-driven path, served by
 * the Shell; `PREVIEW` is this module's own, so the Settings proxy pages publishing it lazy-load this module.
 */
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

export function registerSequenceCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SEQUENCE_DEFINITION_SCHEMA_NAME, ESSENTIAL_MODULE);
	registerSchemaModule(SEQUENCE_COUNTER_SCHEMA_NAME, ESSENTIAL_MODULE);
	registerSchemaModule(SEQUENCE_ISSUANCE_SCHEMA_NAME, ESSENTIAL_MODULE);
	registerCrudService(SEQUENCE_DEFINITION_SCHEMA_NAME, sequenceDefinitionService);
	registerCrudService(SEQUENCE_COUNTER_SCHEMA_NAME, sequenceCounterService);
	registerCrudService(SEQUENCE_ISSUANCE_SCHEMA_NAME, sequenceIssuanceService);

	// A contextual action publishes the record's `{id, etag}`: the preview renders its saved configuration.
	return bus.subscribe(
		SequenceDefinitionCommands.PREVIEW,
		cmd => sequenceDefinitionService.previewSaved(cmd.payload as { id: string }),
	);
}
