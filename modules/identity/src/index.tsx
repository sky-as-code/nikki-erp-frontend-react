import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import {
	defineWebComponent, initMicroAppStateContext, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider,
} from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from './constants';
import { registerGroupCommands } from './features/group/commands';
import { registerOrganizationCommands } from './features/organization/commands';
import { registerRoleCommands } from './features/role/commands';
import { registerUserCommands } from './features/user/commands';
import { buildIdentityMenu } from './menu';
import { buildGroupPages } from './pages/group';
import { buildOrganizationPages } from './pages/organization';
import { buildRolePages } from './pages/role';
import { buildUserPages } from './pages/user';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, slug, registerReducer, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, { htmlTag, domType });

		const result = registerReducer(identityReducer);
		initMicroAppStateContext(result);

		registerModelSchemas();
		host.menuRegistry.register(buildIdentityMenu(slug));
		registerUserCommands(host.commandBus);
		registerGroupCommands(host.commandBus);
		registerOrganizationCommands(host.commandBus);
		registerRoleCommands(host.commandBus);

		return { domType };
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => [
		...buildUserPages(),
		...buildGroupPages(),
		...buildOrganizationPages(),
		...buildRolePages(),
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
		schemaName: c.ROLE_SCHEMA_NAME,
		resourcePath: 'v1/iam/roles',
	}, {
		schemaName: c.USER_SCHEMA_NAME,
		resourcePath: 'v1/iam/users',
	}]);
}
