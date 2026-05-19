import React from 'react';
import { useParams } from 'react-router-dom';

import { ResourceDetail, ResourceDetailTemplateProps } from './ResourceDetail';
import { ResourceList, ResourceListTemplateProps } from './ResourceList';
import { RenderPrimaryParams, SplitLayout } from '../SplitLayout';


export type ResourceSplitViewParams = {
	primaryProps: ResourceListTemplateProps;
	secondaryProps: ResourceDetailTemplateProps;
};

export type ResourceSplitViewProps = {
	props: ResourceSplitViewParams;
	routePath: string;
};


export function ResourceSplitView({ props, routePath }: ResourceSplitViewProps): React.ReactNode {
	const [isStartFromList, setIsStartFromList] = React.useState<boolean | null>(null);
	const { primaryProps, secondaryProps } = props;
	const params = useParams();
	const isFirstPage = params.id === undefined;
	const isSecondaryPage = params.id !== undefined;
	const isPrimaryOpen = isStartFromList || isFirstPage;
	const isSecondaryOpen = isSecondaryPage;

	const renderPrimary = React.useCallback(() => {
		return isPrimaryOpen && <ResourceList
			routePath={routePath}
			props={new ResourceListTemplateProps(primaryProps.params)}
		/>;
	}, [primaryProps, routePath, isPrimaryOpen]);

	const renderSecondary = React.useCallback(() => {
		return isSecondaryOpen && <ResourceDetail props={new ResourceDetailTemplateProps(secondaryProps.params)} />;
	}, [secondaryProps, isSecondaryOpen]);

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
