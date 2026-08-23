import { useDynamicModel } from '@nikkierp/ui/hookhoc';
import { usePageContext } from '@nikkierp/viewengine/render';
import React from 'react';
import { useParams } from 'react-router';

import { ResourceCreate } from './ResourceCreate';
import { ResourceDetailProvider } from './ResourceDetailProvider';
import { ResourceUpdate } from './ResourceUpdate';
import { PageContainer } from '../../components/PageContainer';
import { resourceTestIdPrefix } from '../../testIds';

import type { ResourceDetailProps } from './props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export type ResourceDetailViewProps = {
	/** Validated page params, passed as-is from the page metadata. */
	params: ResourceDetailProps,
	childrenNodes?: ComponentNode[],
};

/**
 * Renders the detail container and {@link ResourceDetailProvider}, delegating the body to
 * {@link ResourceUpdate} / {@link ResourceCreate}, which build their subtrees from a
 * metadata node tree via the component registry.
 */
export const ResourceDetail = React.memo(ResourceDetailView);

function ResourceDetailView({ params, childrenNodes }: ResourceDetailViewProps): React.ReactNode {
	const pack = useDynamicModel(params.schemaName);
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
				)}
			</PageContainer>
		</ResourceDetailProvider>
	);
}
