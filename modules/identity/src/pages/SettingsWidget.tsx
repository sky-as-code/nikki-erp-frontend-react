import { Stack } from '@mantine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { SettingsDataProvider, SettingsSaveBar } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from '../constants';
import { buildIamSettingsNodes } from './settings';

import type { SettingLevel } from '@nikkierp/viewkit-mantine/props';


/**
 * The levels this module registers settings at, and so the endpoints its pane reads.
 *
 * Tenant only -- `registerTenantSettings` declares one schema. Listing a level this module does
 * not register would read an endpoint that returns nothing and leave every item in that section
 * without a control.
 */
const LEVELS: SettingLevel[] = ['tenant'];

/**
 * IAM's `pages.settings` widget: the pane the Settings module mounts for this module.
 *
 * Both settings are tenant-wide and non-overridable, so for anyone below the tenant the backend
 * reports them `editable: false` and the controls render disabled with the enforced caption. That
 * is the intended reading, not a permission failure.
 */
export function SettingsWidget(): React.ReactNode {
	const nodes = React.useMemo(() => buildIamSettingsNodes(), []);
	const [reloadKey, setReloadKey] = React.useState(0);

	return (
		<SettingsDataProvider key={reloadKey} moduleKey={c.IAM_MODULE} levels={LEVELS}>
			<Stack gap='xl'>
				<MetaComponent node={nodes} />
				<SettingsSaveBar
					moduleKey={c.IAM_MODULE}
					onSaved={() => setReloadKey(key => key + 1)}
				/>
			</Stack>
		</SettingsDataProvider>
	);
}
