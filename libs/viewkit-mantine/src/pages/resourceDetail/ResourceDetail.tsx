import { useDynamicModel } from '@nikkierp/ui/hookhoc';
import React from 'react';
import { useParams } from 'react-router';

import { ResourceCreate } from './ResourceCreate';
import { ResourceDetailProvider } from './ResourceDetailProvider';
import { ResourceUpdate } from './ResourceUpdate';
import { PageContainer } from '../../components/PageContainer';

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

	return (
		<ResourceDetailProvider
			translationNs={params.translationNs}
			schemaPack={pack}
			isReading={false}
			isWriting={false}
		>
			<PageContainer>
				{createMode ? (
					<ResourceCreate
						commands={commands}
						titleLvl1={params.titleLvl1}
						titleLvl3={params.titleLvl3}
						blocks={params.formSections}
					/>
				) : (
					<ResourceUpdate
						standardActionCommands={commands}
						allStatuses={params.allStatuses}
						currentStatus={params.currentStatus}
						contextualActions={params.contextualActions}
						titleLvl1={params.titleLvl1}
						titleLvl2={params.titleLvl2}
						titleLvl3={params.titleLvl3}
						blocks={params.formSections}
						childrenNodes={nodes}
					/>
				)}
			</PageContainer>
		</ResourceDetailProvider>
	);
}
