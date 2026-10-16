import { Stack } from '@mantine/core';
import { useDefaultLanguage, useEnabledLanguages } from '@nikkierp/shell/languages';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { SettingsDataProvider, SettingsSaveBar } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useTranslation } from 'react-i18next';

import * as c from '../constants';
import { buildEssentialSettingsNodes } from './settings';

import type { SettingOption } from '@nikkierp/viewkit-mantine';
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
	const { options, displayDefaults } = useLanguageChoices();

	return (
		<SettingsDataProvider
			key={reloadKey}
			moduleKey={c.ESSENTIAL_MODULE}
			levels={LEVELS}
			options={options}
			displayDefaults={displayDefaults}
		>
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

/**
 * The enabled languages by name for both language settings, and what each shows when nothing is
 * stored: a user who never chose sees the language they are reading; an organization that never
 * chose sees the system default, which is what its members fall back to.
 */
function useLanguageChoices(): {
	options: Record<string, SettingOption[]>,
	displayDefaults: Record<string, unknown>,
} {
	const languages = useEnabledLanguages();
	// i18n rather than the Shell's local settings: this widget renders in the micro-app's own React
	// root, where the Shell's store is not the one its hooks read, and i18n *is* what is on screen.
	const { i18n } = useTranslation();
	const languageCode = i18n.language;
	const defaultLanguage = useDefaultLanguage();

	return React.useMemo(() => {
		const choices = languages.map(language => ({ value: language.isoCode, label: language.name }));
		return {
			options: { language: choices, system_language: choices },
			displayDefaults: {
				...(languageCode ? { 'user:language': languageCode } : {}),
				...(defaultLanguage ? { 'org:system_language': defaultLanguage } : {}),
			},
		};
	}, [languages, languageCode, defaultLanguage]);
}
