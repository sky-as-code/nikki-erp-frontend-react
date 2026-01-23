import { MantineProvider } from '@mantine/core';
import { useSetMenuBarItems } from '@nikkierp/ui/appState';
import {
	AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';

import { reducer } from './appState';
import { useMenuBarItems } from './features/common/hooks';
import { AppRouteElements, WidgetRouteElements } from './routes';


function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();
	const menuBar = useMenuBarItems();

	useSetMenuBarItems(menuBar, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MantineProvider>
				<MicroAppRouter
					domType={props.domType}
					basePath={props.routing.basePath}
					widgetName={props.widgetName}
					widgetProps={props.widgetProps}
				>
					<AppRoutes>
						{AppRouteElements}
					</AppRoutes>
					<WidgetRoutes>
						{WidgetRouteElements}
					</WidgetRoutes>
				</MicroAppRouter>
			</MantineProvider>
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, registerReducer }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);
		return {
			domType,
		};
	},
};

export default bundle;
