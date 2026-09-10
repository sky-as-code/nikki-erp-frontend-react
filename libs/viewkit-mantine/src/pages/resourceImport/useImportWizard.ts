import { withOrgId } from '@nikkierp/common/service';
import React from 'react';

import { autoMatch, buildMappingPayload, missingMandatory, moveSource, moveTarget } from './autoMatch';
import { parseHeaders, validateImportFile } from './parseHeaders';

import type { MappingRow } from './autoMatch';
import type { FileRefusal } from './parseHeaders';
import type { ImportTarget } from './targets';
import type { RestBulkCreateResponse, SchemaPack } from '@nikkierp/common/dynamicModel';
import type { ClientErrorItem } from '@nikkierp/common/types';


export type ImportStep = 'upload' | 'mapping' | 'running' | 'summary';

/** Why the chosen file cannot go on: a pre-upload refusal, or a file with no header row. */
export type ImportFileProblem = NonNullable<FileRefusal> | 'noHeaders';

export type ImportWizardState = {
	step: ImportStep,
	file: File | null,
	fileProblem: ImportFileProblem | null,
	rows: MappingRow[],
	createMissing: boolean,
	result: RestBulkCreateResponse | null,
	/** Request-level refusals (400): the mapping itself was rejected, the rows never ran. */
	requestErrors: ClientErrorItem[],
	/** A technical failure (thrown), shown verbatim: there is nothing the user can retype. */
	failure: string | null,
};

const INITIAL: ImportWizardState = {
	step: 'upload', file: null, fileProblem: null, rows: [], createMissing: false,
	result: null, requestErrors: [], failure: null,
};

export type ImportWizard = {
	state: ImportWizardState,
	missing: ImportTarget[],
	/** Validates and parses the file in the browser, then opens the mapping step. */
	selectFile: (file: File) => Promise<void>,
	moveSourceRow: (from: number, to: number) => void,
	moveTargetRow: (from: number, to: number) => void,
	setCreateMissing: (value: boolean) => void,
	/** Uploads file + mapping and moves to the summary, or back to mapping on a refusal. */
	start: () => Promise<void>,
	reset: () => void,
};

/** Uploads file + mapping; answers the state patch for the outcome, never throws. */
async function runImport(
	pack: SchemaPack, schemaName: string, state: ImportWizardState, languageCode: string,
): Promise<Partial<ImportWizardState>> {
	try {
		const mapping = buildMappingPayload(state.rows, languageCode, state.createMissing);
		const request = await withOrgId({ file: state.file as File, mapping }, pack, schemaName);
		const result = await pack.restApi.importFile(request);
		if (result.clientErrors.length > 0 || !result.data) {
			return { step: 'mapping', requestErrors: result.clientErrors };
		}
		return { step: 'summary', result: result.data };
	}
	catch (error) {
		return { step: 'mapping', failure: error instanceof Error ? error.message : String(error) };
	}
}

/**
 * The state machine behind the import page. Pure state plus two async transitions; every
 * rendering decision stays in the step components.
 */
export function useImportWizard(
	pack: SchemaPack | null, schemaName: string, targets: ImportTarget[], languageCode: string,
): ImportWizard {
	const [state, setState] = React.useState<ImportWizardState>(INITIAL);

	const selectFile = React.useCallback(async (file: File) => {
		const refusal = validateImportFile(file);
		if (refusal) {
			setState(current => ({ ...current, file, fileProblem: refusal }));
			return;
		}
		const parsed = await parseHeaders(file);
		if (parsed.headers.length === 0) {
			setState(current => ({ ...current, file, fileProblem: 'noHeaders' }));
			return;
		}
		setState(current => ({
			...current, file, fileProblem: null, requestErrors: [], failure: null,
			rows: autoMatch(parsed.headers, targets), step: 'mapping',
		}));
	}, [targets]);

	const start = React.useCallback(async () => {
		if (!pack || !state.file) {
			return;
		}
		setState(current => ({ ...current, step: 'running', requestErrors: [], failure: null }));
		const outcome = await runImport(pack, schemaName, state, languageCode);
		setState(current => ({ ...current, ...outcome }));
	}, [pack, schemaName, state, languageCode]);

	return {
		state,
		missing: missingMandatory(state.rows),
		selectFile,
		moveSourceRow: (from, to) => setState(current => ({ ...current, rows: moveSource(current.rows, from, to) })),
		moveTargetRow: (from, to) => setState(current => ({ ...current, rows: moveTarget(current.rows, from, to) })),
		setCreateMissing: value => setState(current => ({ ...current, createMissing: value })),
		start,
		reset: () => setState(INITIAL),
	};
}
