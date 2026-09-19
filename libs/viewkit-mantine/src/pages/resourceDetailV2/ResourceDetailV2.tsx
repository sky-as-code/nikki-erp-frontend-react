import { useDynamicModel } from '@nikkierp/ui/hookhoc';
import { usePageContext } from '@nikkierp/viewengine/render';
import React from 'react';
import { useParams } from 'react-router';

import { RelatedResourcesTabs } from './RelatedResourcesTabs';
import { PageContainer } from '../../components/PageContainer';
import { resourceTestIdPrefix } from '../../testIds';
import { ResourceCreate } from '../resourceDetail/ResourceCreate';
import { ResourceDetailProvider } from '../resourceDetail/ResourceDetailProvider';
import { ResourceUpdate } from '../resourceDetail/ResourceUpdate';

import type { ResourceDetailV2Props } from './props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceDetailV2ViewProps = {
	/** Validated page params, passed as-is from the page metadata. */
	params: ResourceDetailV2Props,
	childrenNodes?: ComponentNode[],
};

/**
 * The v1 detail page (same create/update flow, unupdatable fields shown as label + read-only
 * text) followed, in update mode, by the related-resources tabs. Reuses the v1 parts by import:
 * nothing in `resourceDetail/` changes.
 */
export const ResourceDetailV2 = React.memo(ResourceDetailV2View);

function ResourceDetailV2View({ params, childrenNodes }: ResourceDetailV2ViewProps): React.ReactNode {
	const { pack } = useDynamicModel(params.schemaName);
	const { id } = useParams();
	const createMode = id === 'new';
	const commands = params.standardActionCommands;
	const nodes = childrenNodes ?? params.childrenNodes;
	const testId = resourceTestIdPrefix({
		testId: params.testId,
		routePath: usePageContext()?.routePath,
		schemaName: params.schemaName,
		part: createMode ? 'Create' : 'Detail',
	});

	return (
		<ResourceDetailProvider
			translationNs={params.translationNs}
			schemaPack={pack}
			isReading={false}
			isWriting={false}
			testId={testId}
		>
			<PageContainer>
				{createMode ? (
					<ResourceCreate
						commands={commands}
						titleLvl1={params.titleLvl1}
						backLinkTitle={params.backLinkTitle}
						createNodes={params.createNodes}
					/>
				) : (
					<>
						<ResourceUpdate
							standardActionCommands={commands}
							allStatuses={params.allStatuses}
							currentStatus={params.currentStatus}
							contextualActions={params.contextualActions}
							titleLvl1={params.titleLvl1}
							titleLvl2={params.titleLvl2}
							backLinkTitle={params.backLinkTitle}
							childrenNodes={nodes}
						/>
						<RelatedResourcesTabs
							resources={params.relatedResources}
							header={params.relatedResourcesHeader}
							translationNs={params.translationNs}
						/>
					</>
				)}
			</PageContainer>
		</ResourceDetailProvider>
	);
}
