import { Group } from '@mantine/core';
import { Button, LinkButton } from '@nikkierp/ui/components';
import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';
import { z } from 'zod';

import { useImportWizardContext } from './importWizardContext';
import { RESOURCE_IMPORT_ACTIONS } from '../../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const importActionsPropsSchema = z.object({}).strict();

export type ImportActionsProps = z.infer<typeof importActionsPropsSchema>;

/**
 * The wizard's buttons, rendered in the generic page header's action row.
 *
 * Which buttons exist is a function of the step, so this is one component rather than three: the
 * action row is a fixed slot in the header, and swapping its contents per step is what keeps the
 * primary action in the same place throughout the wizard.
 */
export const importActionsRenderer: IComponentRenderer<ImportActionsProps> = {
	type: RESOURCE_IMPORT_ACTIONS,
	propsSchema: importActionsPropsSchema,
	render() {
		return <ImportActions />;
	},
};

function ImportActions(): React.ReactNode {
	const context = useImportWizardContext();
	if (!context) {
		return null;
	}
	const { wizard, t, tid, backHref } = context;
	const { step } = wizard.state;

	return (
		<Group gap='sm' {...componentAttrs(RESOURCE_IMPORT_ACTIONS)}>
			{step === 'upload' ? <UploadActions /> : null}
			{step === 'mapping' || step === 'running' ? <MappingActions /> : null}
			{step === 'summary' ? (
				<>
					{backHref ? (
						<LinkButton to={backHref} variant='filled' {...tid('backToList')}>
							{t('import.backToList')}
						</LinkButton>
					) : null}
					<Button onClick={wizard.reset} {...tid('restart')}>{t('import.title')}</Button>
				</>
			) : null}
		</Group>
	);
}

/**
 * The upload step's confirm button lives here while the file it acts on is picked in the body, so
 * the two talk through the wizard's pending-file state rather than through props.
 */
function UploadActions(): React.ReactNode {
	const context = useImportWizardContext();
	const wizard = context?.wizard;
	const pending = wizard?.state.pendingFile ?? null;
	const [busy, setBusy] = React.useState(false);

	if (!context || !wizard) {
		return null;
	}
	const confirm = async () => {
		if (!pending) {
			return;
		}
		setBusy(true);
		try {
			await wizard.selectFile(pending);
		}
		finally {
			setBusy(false);
		}
	};

	return (
		<Button
			variant='filled' disabled={!pending} loading={busy}
			onClick={() => void confirm()} {...context.tid('confirm')}
		>
			{context.t('import.confirmNext')}
		</Button>
	);
}

function MappingActions(): React.ReactNode {
	const context = useImportWizardContext();
	if (!context) {
		return null;
	}
	const { wizard, t, tid } = context;
	const running = wizard.state.step === 'running';

	return (
		<Button
			variant='filled'
			disabled={wizard.missing.length > 0}
			loading={running}
			onClick={() => void wizard.start()}
			{...tid('start')}
		>
			{running ? t('import.running') : t('import.start')}
		</Button>
	);
}
