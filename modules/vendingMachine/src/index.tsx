import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { PermissionScope, useActiveOrgDetail } from '@nikkierp/shell/userContext';
import { useSetMenuBarItems } from '@nikkierp/ui/appState';
import {
	AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';

import { reducer } from './appState';
import { useMenuBarItems } from './hooks';
import { appRoutes, renderAppRoutes, widgetRoutes, renderWidgetRoutes } from './routes';


const useOrgContextScope = () : PermissionScope | undefined => {
	const activeOrg = useActiveOrgDetail();
	const isGlobalContext = activeOrg?.slug === GLOBAL_CONTEXT_SLUG;
	return isGlobalContext ? undefined : { scopeType: 'org', scopeRef: activeOrg?.id ?? '' };
};


function Main(props: MicroAppProps) {
	const orgContextScope = useOrgContextScope();
	const dispatch = useMicroAppDispatch();
	const menuBar = useMenuBarItems();

	useSetMenuBarItems(menuBar, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MicroAppRouter
				domType={props.domType}
				basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					{renderAppRoutes(appRoutes, orgContextScope)}
				</AppRoutes>
				<WidgetRoutes>
					{renderWidgetRoutes(widgetRoutes, orgContextScope)}
				</WidgetRoutes>
			</MicroAppRouter>
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
