import { Stack } from '@mantine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { SettingsDataProvider, SettingsSaveBar } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from '../constants';
import { buildEssentialSettingsNodes } from './settings';

import type { SettingLevel } from '@nikkierp/viewkit-mantine/props';


/**
 * The levels this module registers settings at, and so the endpoints its pane reads.
 *
 * One request per level: the level is a path segment rather than a payload field. These must
 * match the levels `register_settings.go` registers a schema for, or the pane loads nothing for
 * the missing one and every item in it renders without a control.
 */
const LEVELS: SettingLevel[] = ['user', 'org'];

/**
 * Essential's `pages.settings` widget: the pane the Settings module mounts for this module.
 *
 * It renders metadata rather than components, the same way a resource page does, so what this
 * module exposes for configuration stays a serializable list rather than a React tree only this
 * file understands. The provider around it holds the loaded values and the unsaved edits, which
 * are not metadata and never enter the nodes.
 */
export function SettingsWidget(): React.ReactNode {
	const nodes = React.useMemo(() => buildEssentialSettingsNodes(), []);
	const [reloadKey, setReloadKey] = React.useState(0);

	return (
		<SettingsDataProvider key={reloadKey} moduleKey={c.ESSENTIAL_MODULE} levels={LEVELS}>
			<Stack gap='xl'>
				<MetaComponent node={nodes} />
				{/* Remounting the provider is the reload: a save that fanned out onto other rows,
					or was clamped by validation, leaves the server holding values this pane has
					not seen. */}
				<SettingsSaveBar
					moduleKey={c.ESSENTIAL_MODULE}
					onSaved={() => setReloadKey(key => key + 1)}
				/>
			</Stack>
		</SettingsDataProvider>
	);
}
