// import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { BrowserRouter, Router, Routes } from 'react-router-dom';

import { useMicroAppContext } from './MicroAppProvider';
import { MicroAppDomType, MicroAppProps } from './types';


export { Route as AppRoute } from 'react-router-dom';

type MicroAppRouterContextType = {
	basePath?: string;
};

const RouterContext = React.createContext<MicroAppRouterContextType | null>(null);

export function useMicroAppRouterContext(): MicroAppRouterContextType {
	const context = React.useContext(RouterContext);
	if (!context) {
		throw new Error('useRouterContext must be used within a MicroAppRouterContext.Provider');
	}
	return context;
}

export type MicroAppRouterProps = React.PropsWithChildren & {
	/**
	 * Indicates how the parent Shell has mounted this micro-app.
	 */
	domType: MicroAppDomType;

	/**
	 * Only effective in ISOLATED domType. This will be passed to the micro-app's router.
	 */
	basePath?: string;

	/**
	 * The wiget route name to render the corresponding widget component.
	 * If specified, `basePath` will be ignored because widget is supposed to be static with no routing.
	 */
	widgetName?: string;

	/**
	 * This object is passed as-is to the widget component.
	 */
	widgetProps?: Record<string, any>,
};

export function MicroAppRouter({ children, ...props }: MicroAppRouterProps) {
	const { routing } = useMicroAppContext();

	if (props.widgetName && props.basePath) {
		throw new Error('widgetPath and basePath must not be specified at the same time');
	}

	let routeGroupElem: React.ReactElement<React.PropsWithChildren> | null = null;
	let reactNode: React.ReactNode = null;

	if (props.widgetName) {
		routeGroupElem = findChildRouteGroup(children, WidgetRoutes);
		if (!routeGroupElem) {
			throw new Error(`<MicroAppRouter> in widget mode requires one child of type <WidgetRoutes>`);
		};
		reactNode = <WidgetRouter routeGroupElem={routeGroupElem} {...props} />;
	}
	else {
		routeGroupElem = findChildRouteGroup(children, AppRoutes);
		if (!routeGroupElem) {
			throw new Error(`<MicroAppRouter> in app mode requires one child of type <AppRoutes>`);
		};
		reactNode = renderAppRoutes(props, routeGroupElem, routing);
	}

	return (
		<RouterContext.Provider value={{ basePath: props.basePath }}>
			{reactNode}
		</RouterContext.Provider>
	);
}


function findChildRouteGroup(
	children: React.ReactNode, Component: React.ComponentType<any>,
): React.ReactElement<React.PropsWithChildren> | null {
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
	routing: MicroAppProps['routing'],
): React.ReactNode {
	// If this micro-app is not mounted under a Router in Shell.
	if (!routing.location) {
		return (
			<BrowserRouter basename={props.basePath}>
				<Routes>
					{routeGroupElem.props.children}
				</Routes>
			</BrowserRouter>
		);
	}

	if (props.domType === MicroAppDomType.ISOLATED) {
		// TODO: location and navgator are not sync with Shell's Router.
		return (
			<Router basename={props.basePath} location={routing.location!} navigator={routing.navigator!}>
				<Routes>
					{routeGroupElem.props.children}
				</Routes>
			</Router>
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

export function AppRoutes(_props: React.PropsWithChildren): null {
	return null;
}

export function WidgetRoutes(_props: React.PropsWithChildren): null {
	return null;
}

export type WidgetRouteProps = {
	name: string,
	Component: React.ComponentType<WidgetComponentProps>,
};

export function WidgetRoute(_props: WidgetRouteProps): null {
	return null;
}

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
function WidgetRouter(props: WidgetRouterProps) {
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
}
