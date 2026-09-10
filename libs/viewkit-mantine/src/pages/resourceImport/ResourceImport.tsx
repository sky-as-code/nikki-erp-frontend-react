import { Stack, Title } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { LoadingState } from '@nikkierp/ui/components';
import { useDynamicModel } from '@nikkierp/ui/hookhoc';
import { useI18n, useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { MappingStep } from './MappingStep';
import { SummaryStep } from './SummaryStep';
import { buildImportTargets } from './targets';
import { UploadStep } from './UploadStep';
import { useImportWizard } from './useImportWizard';
import { PageContainer } from '../../components/PageContainer';
import { useResourceBaseHref } from '../../data/useResourceLinkHref';
import { resourceTestIdPrefix } from '../../testIds';

import type { ResourceImportProps } from './props';


const COMMON_NS = 'common';

export type ResourceImportViewProps = {
	/** Validated page params, passed as-is from the page metadata. */
	params: ResourceImportProps,
	/** View-engine page segment (e.g. `product_categories/import`). */
	routePath: string,
};

export const ResourceImport = React.memo(ResourceImportView);

function ResourceImportView({ params, routePath }: ResourceImportViewProps): React.ReactNode {
	const pack = useDynamicModel(params.schemaName);
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

	if (!pack) {
		return <LoadingState />;
	}
	const { step, result } = wizard.state;
	return (
		<PageContainer>
			<Stack gap='md' p='xs' {...tid('page')}>
				<Title order={3}>{t('import.title')}: {lc(pack.modelSchema.label)}</Title>
				{step === 'upload' ? (
					<UploadStep
						t={t}
						tid={tid}
						file={wizard.state.file}
						problem={wizard.state.fileProblem}
						onSelect={wizard.selectFile}
					/>
				) : null}
				{step === 'mapping' || step === 'running' ? <MappingStep t={t} tid={tid} wizard={wizard} /> : null}
				{step === 'summary' && result ? (
					<SummaryStep
						t={t}
						tid={tid}
						result={result}
						targets={targets}
						backHref={backHref}
						onRestart={wizard.reset}
					/>
				) : null}
			</Stack>
		</PageContainer>
	);
}
