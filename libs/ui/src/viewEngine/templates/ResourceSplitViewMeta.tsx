import React from 'react';

import { ResourceDetailMeta } from './ResourceDetailMeta';
import { ResourceList } from './ResourceList';
import { SplitViewBody } from './ResourceSplitView';

import type { ResourceSplitViewProps } from './ResourceSplitView';


/**
 * Metadata-driven replacement for {@link ResourceSplitView}: same two-pane
 * layout, but the secondary pane renders {@link ResourceDetailMeta} so the
 * detail body is composed from the component registry.
 */
export const ResourceSplitViewMeta = React.memo(ResourceSplitViewMetaView);

function ResourceSplitViewMetaView({ params, routePath }: ResourceSplitViewProps): React.ReactNode {
	const { primaryProps, secondaryProps } = params;
	return (
		<SplitViewBody
			primary={<ResourceList routePath={routePath} params={primaryProps.params} />}
			secondary={<ResourceDetailMeta params={secondaryProps.params} />}
		/>
	);
}
