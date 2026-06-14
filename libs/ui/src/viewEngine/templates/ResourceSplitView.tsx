import React from 'react';
import { useParams } from 'react-router-dom';

import { ResourceDetail, ResourceDetailTemplateProps } from './ResourceDetail';
import { ResourceList, ResourceListTemplateProps } from './ResourceList';
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


export const ResourceSplitView = React.memo(ResourceSplitViewView);

function ResourceSplitViewView({ params: viewParams, routePath }: ResourceSplitViewProps): React.ReactNode {
	const { primaryProps, secondaryProps } = viewParams;
	return (
		<SplitViewBody
			primary={<ResourceList routePath={routePath} params={primaryProps.params} />}
			secondary={<ResourceDetail params={secondaryProps.params} />}
		/>
	);
}

export type SplitViewBodyProps = {
	primary: React.ReactNode,
	secondary: React.ReactNode,
};

/**
 * Two-pane layout shared by {@link ResourceSplitView} and the `resource_split_view`
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


/**
 * Update the address bar without going through react-router's navigate(). We
 * dispatch a synthetic popstate so react-router's BrowserHistory picks up the
 * new URL — this keeps useParams() working in the detail panel while avoiding
 * any other side effects of an imperative navigate().
 */
function softNavigate(href: string): void {
	if (typeof window === 'undefined') return;
	if (window.location.pathname === href) return;
	window.history.pushState(null, '', href);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
