import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';
import { z } from 'zod';

import { useImportWizardContext } from './importWizardContext';
import { MappingStep } from './MappingStep';
import { SummaryStep } from './SummaryStep';
import { UploadStep } from './UploadStep';
import { RESOURCE_IMPORT_BODY } from '../../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const importBodyPropsSchema = z.object({}).strict();

export type ImportBodyProps = z.infer<typeof importBodyPropsSchema>;

/**
 * The current step's body. The step's buttons are not here — they render in the page header's
 * action row through `resourceImport.actions`.
 */
export const importBodyRenderer: IComponentRenderer<ImportBodyProps> = {
	type: RESOURCE_IMPORT_BODY,
	propsSchema: importBodyPropsSchema,
	render() {
		return <ImportBody />;
	},
};

function ImportBody(): React.ReactNode {
	const context = useImportWizardContext();
	if (!context) {
		return null;
	}
	const { wizard, t, tid } = context;
	const { step, result } = wizard.state;

	return (
		<div {...componentAttrs(RESOURCE_IMPORT_BODY)}>
			{step === 'upload' ? (
				<UploadStep
					t={t}
					tid={tid}
					pending={wizard.state.pendingFile}
					problem={wizard.state.fileProblem}
					onPick={wizard.setPendingFile}
				/>
			) : null}
			{step === 'mapping' || step === 'running' ? <MappingStep t={t} tid={tid} wizard={wizard} /> : null}
			{step === 'summary' && result ? (
				<SummaryStep t={t} tid={tid} result={result} targets={context.targets} />
			) : null}
		</div>
	);
}
