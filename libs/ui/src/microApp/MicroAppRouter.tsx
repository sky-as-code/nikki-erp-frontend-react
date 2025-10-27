// import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';

import { MicroAppDomType } from './types';


export { Route as AppRoute } from 'react-router-dom';

export type MicroAppRouterProps = React.PropsWithChildren & {
	domType: MicroAppDomType;

	/**
	 * If specified, the BrowserRouter will be used to provide URL-based routing
	 */
	basePath?: string;

	/**
	 * The routing path to directly navigate to when this MicroApp is used as a widget.
	 */
	widgetName?: string;
	widgetProps?: Record<string, any>,
};

export const MicroAppRouter: React.FC<MicroAppRouterProps> = ({children, ...props}) => {
	if (props.widgetName && props.basePath) {
		throw new Error('widgetPath and basePath must not be specified at the same time');
	}

	let routeGroupElem: React.ReactElement<React.PropsWithChildren> | null = null;

	if (props.widgetName) {
		routeGroupElem = findChildRouteGroup(children, WidgetRoutes);
		if (!routeGroupElem) {
			throw new Error(`<MicroAppRouter> in widget mode requires one child of type <WidgetRoutes>`);
		};
		return <WidgetRouter routeGroupElem={routeGroupElem} {...props} />;
	}
	else {
		routeGroupElem = findChildRouteGroup(children, AppRoutes);
		if (!routeGroupElem) {
			throw new Error(`<MicroAppRouter> in app mode requires one child of type <AppRoutes>`);
		};
		return renderAppRoutes(props, routeGroupElem);
	}

	// if (props.domType === MicroAppDomType.ISOLATED) {
	// 	return (
	// 		<ShadowDOMRoutes basePath={props.basePath}
	// 			widgetPath={props.widgetName}
	// 			widgetProps={props.widgetProps}>
	// 			{routeGroupElem}
	// 		</ShadowDOMRoutes>
	// 	);
	// }
	// else {
	// 	return (
	// 		<SharedDOMRoutes basePath={props.basePath}
	// 			widgetPath={props.widgetName}
	// 			widgetProps={props.widgetProps}>
	// 			{routeGroupElem}
	// 		</SharedDOMRoutes>
	// 	);
	// }
};


function findChildRouteGroup(
	children: React.ReactNode, Component: React.ComponentType<any>,
) : React.ReactElement<React.PropsWithChildren> | null {
	let routeGroupElem: React.ReactElement<React.PropsWithChildren> | null = null;

	React.Children.forEach(children, (element) => {
		if (routeGroupElem || !React.isValidElement(element)) {
			// Ignore non-elements. This allows people to more easily inline
			// conditionals in their route config.
			return;
		}
		if (element.type === Component) {
			routeGroupElem = element as React.ReactElement<React.PropsWithChildren>;
			return;
		}
	});

	return routeGroupElem;
}

function renderAppRoutes(
	props: MicroAppRouterProps,
	routeGroupElem: React.ReactElement<React.PropsWithChildren>,
): React.ReactNode {
	if (props.domType === MicroAppDomType.ISOLATED) {
		return (
			<BrowserRouter basename={props.basePath}>
				<Routes>
					{routeGroupElem.props.children}
				</Routes>
			</BrowserRouter>
		);
	}
	else {
		// No Router is needed because we share the same Router with Shell.
		return (
			<Routes>
				{routeGroupElem.props.children}
			</Routes>
		);
	}
}

export const AppRoutes: React.FC<React.PropsWithChildren> = () => {
	return null;
};

export const WidgetRoutes: React.FC<React.PropsWithChildren> = () => {
	return null;
};

export type WidgetRouteProps = {
	name: string,
	Component: React.ComponentType<WidgetComponentProps>,
};

export const WidgetRoute: React.FC<WidgetRouteProps> = () => {
	return null;
};

export type WidgetComponentProps = {
	domType: MicroAppDomType,
	widgetProps?: Record<string, any>,
};

type WidgetRouterProps = Omit<MicroAppRouterProps, 'children'> & {
	routeGroupElem: React.ReactElement<React.PropsWithChildren>
};

/**
 * In-memory router for widget mod.
 * In Light DOM mode, the Shell's router will not complain about this nested router.
 */
const WidgetRouter: React.FC<WidgetRouterProps> = (props) => {
	const Comp = React.useMemo<React.ComponentType<WidgetComponentProps>>(() => {
		let MatchedComp: React.ComponentType<WidgetComponentProps> | null = null;
		React.Children.forEach(props.routeGroupElem.props.children, (element) => {
			if (MatchedComp || !React.isValidElement(element)) {
			// Ignore non-elements. This allows people to more easily inline
			// conditionals in their route config.
				return;
			}
			if (element.type == WidgetRoute) {
				const p = element.props as WidgetRouteProps;
				if (p.name == props.widgetName) {
					MatchedComp = p.Component;
					return;
				}
			}
			else {
				throw new Error(`[${typeof element.type === 'string' ? element.type : element.type.name}]` +
				' is unexpected component. All component children of <WidgetRoutes> must be <WidgetRoute>',
				);
			}
		});
		return MatchedComp as any;
	}, [props.widgetName, props.widgetProps]);

	return React.createElement(Comp, {
		domType: props.domType,
		widgetProps: props.widgetProps,
	});
};
