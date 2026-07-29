import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import { useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import {
	defineWebComponent, initMicroAppStateContext, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, useMicroAppDispatch,
} from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from './constants';
import { registerGroupCommands } from './features/group/commands';
import { registerOrganizationCommands } from './features/organization/commands';
import { registerUserCommands } from './features/user/commands';
import { useIdentityMenuBarItems } from './hooks';
import { buildGroupPages } from './pages/group';
import { buildOrganizationPages } from './pages/organization';
import { buildUserPages } from './pages/user';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, registerReducer, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, { htmlTag, domType });

		const result = registerReducer(identityReducer);
		initMicroAppStateContext(result);

		registerModelSchemas();
		registerUserCommands(host.commandBus);
		registerGroupCommands(host.commandBus);
		registerOrganizationCommands(host.commandBus);

		return { domType };
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const menuBarItems = useIdentityMenuBarItems();

	useSetMenuBarItems(menuBarItems, dispatch);

	const pages = React.useMemo(() => [
		...buildUserPages(),
		...buildGroupPages(),
		...buildOrganizationPages(),
	], []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages, indexElement: <h1>Identity</h1> }}
		/>
	);
}

function identityReducer(state: Record<string, never> = {}): Record<string, never> {
	return state;
}

function registerModelSchemas(): void {
	schemaRegistry.register([{
		schemaName: c.GROUP_SCHEMA_NAME,
		resourcePath: 'v1/iam/groups',
	}, {
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		resourcePath: 'v1/iam/organizations',
	}, {
		schemaName: c.ORG_UNIT_SCHEMA_NAME,
		resourcePath: 'v1/iam/orgunits',
	}, {
		schemaName: c.USER_SCHEMA_NAME,
		resourcePath: 'v1/iam/users',
	}]);
}
