import React from 'react';

import type { ImportTarget } from './targets';
import type { ImportWizard } from './useImportWizard';
import type { TranslateFn } from '@nikkierp/ui/i18n';


/**
 * The running wizard, for the nodes the import page renders through the component registry.
 *
 * The wizard is a React state machine, so it cannot travel in page metadata: the node tree
 * carries only the component ids, and each renderer reaches the live wizard through here.
 */
export type ImportWizardContextValue = {
	wizard: ImportWizard,
	t: TranslateFn,
	tid: (part: string) => Record<string, string>,
	/** Import targets derived from the model schema, for the summary's error labels. */
	targets: ImportTarget[],
	/** Listing page the summary and the header's back link return to. */
	backHref: string | undefined,
};

const ImportWizardContext = React.createContext<ImportWizardContextValue | null>(null);

export function ImportWizardProvider({ value, children }: {
	value: ImportWizardContextValue,
	children: React.ReactNode,
}): React.ReactNode {
	return <ImportWizardContext.Provider value={value}>{children}</ImportWizardContext.Provider>;
}

export function useImportWizardContext(): ImportWizardContextValue | null {
	return React.useContext(ImportWizardContext);
}
