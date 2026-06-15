import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import { useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import {
	defineWebComponent, initMicroAppStateContext, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, useMicroAppDispatch,
} from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/ui/viewEngine';
import React from 'react';

import * as c from './constants';
import { registerGroupCommands } from './features/group/commands';
import { registerOrganizationCommands } from './features/organization/commands';
import { registerUserCommands } from './features/user/commands';
import { useIdentityMenuBarItems } from './hooks';
import { registerGroupPages } from './pages/group';
import { registerOrganizationPages } from './pages/organization';
import { registerUserPages } from './pages/user';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, registerReducer, commandBus }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, { htmlTag, domType });

		const result = registerReducer(identityReducer);
		initMicroAppStateContext(result);

		registerModelSchemas();
		registerUserCommands(commandBus);
		registerGroupCommands(commandBus);
		registerOrganizationCommands(commandBus);

		return { domType };
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const menuBarItems = useIdentityMenuBarItems();

	useSetMenuBarItems(menuBarItems, dispatch);

	const pages = React.useMemo(() => [
		...registerUserPages(),
		...registerGroupPages(),
		...registerOrganizationPages(),
	], []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages }}
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
