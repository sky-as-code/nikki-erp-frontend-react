import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import {
	defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps, MicroAppProvider,
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
import { buildRoleAssignmentPages } from './pages/roleAssignment';
import { SettingsWidget } from './pages/SettingsWidget';
import { buildUserPages } from './pages/user';
import { contributeIdentityViewKit } from './viewkit/kit';

import type { WidgetDefinition } from '@nikkierp/viewkit-mantine';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, slug, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, { htmlTag, domType });

		// No `registerReducer`: identity keeps its state in its own store (`./store`), and
		// reaches the Shell only through the command and event buses.
		registerModelSchemas();
		// IAM-specific templates go onto the host-owned engine, never a new instance.
		contributeIdentityViewKit(host.viewEngine);
		host.menuRegistry.register(buildIdentityMenu(slug));
		registerUserCommands(host.commandBus);
		registerGroupCommands(host.commandBus);
		registerOrganizationCommands(host.commandBus);
		registerRoleCommands(host.commandBus);

		return { domType };
	},
};

export default bundle;

/**
 * Mounted by the Settings module. The name is the contract between the two; neither imports the
 * other.
 */
const WIDGETS: WidgetDefinition[] = [
	{ name: 'pages.settings', Component: SettingsWidget },
];

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => [
		...buildUserPages(),
		...buildGroupPages(),
		...buildOrganizationPages(),
		...buildRolePages(),
		...buildRoleAssignmentPages(),
	], []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages, indexElement: <h1>Identity</h1>, widgets: WIDGETS }}
		/>
	);
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
