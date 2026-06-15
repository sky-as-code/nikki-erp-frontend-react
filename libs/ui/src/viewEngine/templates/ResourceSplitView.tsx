import React from 'react';
import { useParams } from 'react-router-dom';

import { ResourceDetailTemplateProps } from './ResourceDetail';
import { ResourceListTemplateProps } from './ResourceList';
import { SplitLayout } from '../SplitLayout';

import type { IPageProps } from '../core';


export type ResourceSplitViewParams = {
	primaryProps: ResourceListTemplateProps;
	secondaryProps: ResourceDetailTemplateProps;
};

export class ResourceSplitViewTemplateProps implements IPageProps<ResourceSplitViewParams> {
	public readonly params: ResourceSplitViewParams;

	constructor(params: ResourceSplitViewParams) {
		this.params = params;
	}
}

export type ResourceSplitViewProps = {
	/** Strongly-typed page params, passed as-is from `ResourceSplitViewTemplateProps.params`. */
	params: ResourceSplitViewParams;
	routePath: string;
};

export type SplitViewBodyProps = {
	primary: React.ReactNode,
	secondary: React.ReactNode,
};

/**
 * Two-pane layout shared by {@link ResourceSplitViewMeta} and the `resource_split_view`
 * component renderer. The secondary pane opens when the route carries an `:id`.
 */
export function SplitViewBody({ primary, secondary }: SplitViewBodyProps): React.ReactNode {
	const [isStartFromList, setIsStartFromList] = React.useState<boolean | null>(null);
	const params = useParams();
	const isFirstPage = params.id === undefined;
	const isSecondaryPage = params.id !== undefined;
	const isPrimaryOpen = isStartFromList || isFirstPage;
	const isSecondaryOpen = isSecondaryPage;

	const renderPrimary = React.useCallback(() => isPrimaryOpen && primary, [isPrimaryOpen, primary]);
	const renderSecondary = React.useCallback(() => isSecondaryOpen && secondary, [isSecondaryOpen, secondary]);

	React.useEffect(() => {
		if (isStartFromList === null || !isSecondaryPage) {
			setIsStartFromList(!isSecondaryPage);
		}
	}, [isStartFromList, isSecondaryPage]);

	return (isStartFromList != null) && (
		<SplitLayout
			primaryOpen={isPrimaryOpen}
			secondaryOpen={isSecondaryOpen}
			renderPrimary={renderPrimary}
			renderSecondary={renderSecondary}
		/>
	);
}
