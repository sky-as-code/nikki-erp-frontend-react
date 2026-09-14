import { testAttrs } from '@nikkierp/common/utils';
import { LoadingState } from '@nikkierp/ui/components';
import { useDynamicModel } from '@nikkierp/ui/hookhoc';
import { useI18n, useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import React from 'react';

import { ImportWizardProvider } from './importWizardContext';
import { buildImportTargets } from './targets';
import { useImportWizard } from './useImportWizard';
import { useResourceBaseHref } from '../../data/useResourceLinkHref';
import { RESOURCE_IMPORT_ACTIONS, RESOURCE_IMPORT_BODY } from '../../ids';
import { collapsibleSectionNode } from '../../props';
import { resourceTestIdPrefix } from '../../testIds';
import { ResourceGenericPage } from '../resourceGenericPage/ResourceGenericPage';

import type { ImportWizardContextValue } from './importWizardContext';
import type { ResourceImportProps } from './props';
import type { ResourceGenericPageProps } from '../resourceGenericPage/props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const COMMON_NS = 'common';

export type ResourceImportViewProps = {
	/** Validated page params, passed as-is from the page metadata. */
	params: ResourceImportProps,
	/** View-engine page segment (e.g. `product_categories/import`). */
	routePath: string,
};

export const ResourceImport = React.memo(ResourceImportView);

/**
 * The import wizard, rendered as a `resourceGenericPage`: it belongs to one resource but edits no
 * record, so it takes that page's header and shell — back link to the resource's listing, action
 * row in the same place a detail page puts Update/Save — without opening a resource-update
 * context it has no record for.
 *
 * The step components are reached through the component registry rather than rendered here, so
 * the page is the same node tree a detail page is; the live wizard reaches them through
 * {@link ImportWizardProvider}, since a state machine cannot travel in JSON metadata.
 */
function ResourceImportView({ params, routePath }: ResourceImportViewProps): React.ReactNode {
	const { pack } = useDynamicModel(params.schemaName);
	// Module namespace first for `$ref` field labels, `common` for the page's own words.
	const t = useTranslate([params.translationNs, COMMON_NS]);
	const lc = useLocalize(params.translationNs);
	const language = useI18n().language;
	const backHref = useResourceBaseHref(params.returnRoutePath);
	const prefix = resourceTestIdPrefix({
		testId: params.testId, routePath, schemaName: params.schemaName, part: 'Import',
	});
	const tid = React.useCallback((part: string) => testAttrs(prefix, part), [prefix]);

	const referenceSuffix = t('import.referenceSuffix');
	const targets = React.useMemo(
		() => (pack ? buildImportTargets(pack.modelSchema, language, key => t(key), referenceSuffix) : []),
		[pack, language, t, referenceSuffix],
	);
	const wizard = useImportWizard(pack, params.schemaName, targets, language);
	const context = React.useMemo(
		(): ImportWizardContextValue => ({ wizard, t, tid, targets, backHref }),
		[wizard, t, tid, targets, backHref],
	);

	// Two title levels, as on a detail page: the action names the page, the resource names what it
	// acts on. Keeps the existing `import.title` key rather than inventing a combined one.
	const modelLabel = lc(pack?.modelSchema.label);
	const pageParams = React.useMemo(
		(): ResourceGenericPageProps => ({
			schemaName: params.schemaName,
			translationNs: params.translationNs,
			titleLvl1: { textKey: 'import.title' },
			// Already localized here: the label comes from the model schema, not from this app's
			// translation files, so it arrives as text rather than as a key.
			titleLvl2: modelLabel ? { text: modelLabel } : undefined,
			// `'../'` so React Router resolves it against the current route, the spelling every
			// resource detail page uses for its own back link.
			backLinkTitle: { linkHref: '../' },
			testId: prefix,
		}),
		[params.schemaName, params.translationNs, modelLabel, prefix],
	);

	if (!pack) {
		return <LoadingState />;
	}

	return (
		<ImportWizardProvider value={context}>
			<ResourceGenericPage
				params={pageParams}
				routePath={routePath}
				part='Import'
				actionNodes={ACTION_NODES}
				childrenNodes={BODY_NODES}
			/>
		</ImportWizardProvider>
	);
}

const ACTION_NODES: ComponentNode[] = [defineComponent({ component: RESOURCE_IMPORT_ACTIONS })];

/**
 * The wizard body in a bordered block, with `collapsible: false`: it is the page's only content,
 * and a step the reader can fold away is a step they can lose track of mid-import.
 */
const BODY_NODES: ComponentNode[] = [
	collapsibleSectionNode({ collapsible: false }, [
		defineComponent({ component: RESOURCE_IMPORT_BODY }),
	]),
];
