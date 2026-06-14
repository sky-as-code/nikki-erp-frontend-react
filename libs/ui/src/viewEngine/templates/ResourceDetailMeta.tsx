import { Stack } from '@mantine/core';
import React from 'react';
import { useParams } from 'react-router';

import { ResourceCreateMeta } from './ResourceCreateMeta';
import { ResourceDetailProvider } from './ResourceDetailProvider';
import { ResourceUpdateMeta } from './ResourceUpdateMeta';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { usePaperBgColor } from '../../theme';

import type { ResourceDetailProps } from './ResourceDetail';


/**
 * Metadata-driven replacement for {@link ResourceDetail}. Renders the same outer
 * container and {@link ResourceDetailProvider}, delegating the body to
 * {@link ResourceUpdateMeta} / {@link ResourceCreateMeta}, which build their
 * subtrees from a metadata node tree via the component registry.
 */
export const ResourceDetailMeta = React.memo(ResourceDetailMetaView);

function ResourceDetailMetaView({ params, childrenNodes }: ResourceDetailProps): React.ReactNode {
	const pack = useDynamicModel(params.schemaName);
	const bgColor = usePaperBgColor();
	const { id } = useParams();
	const createMode = id === 'new';
	const commands = params.standardActionCommands ?? {};
	const nodes = childrenNodes ?? params.childrenNodes;

	return (
		<ResourceDetailProvider
			translationNs={params.translationNs}
			schemaPack={pack}
			isReading={false}
			isWriting={false}
		>
			<Stack
				bg={bgColor}
				className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 px-4 pb-4 flex overflow-auto'
				gap='md'
			>
				{createMode ? (
					<ResourceCreateMeta
						commands={commands}
						titleLvl1={params.titleLvl1}
						titleLvl3={params.titleLvl3}
						blocks={params.ownPropertiesSection ?? []}
					/>
				) : (
					<ResourceUpdateMeta
						standardActionCommands={commands}
						allStatuses={params.allStatuses}
						currentStatus={params.currentStatus}
						contextualActions={params.contextualActions}
						titleLvl1={params.titleLvl1}
						titleLvl2={params.titleLvl2}
						titleLvl3={params.titleLvl3}
						blocks={params.ownPropertiesSection ?? []}
						childrenNodes={nodes}
					/>
				)}
			</Stack>
		</ResourceDetailProvider>
	);
}
