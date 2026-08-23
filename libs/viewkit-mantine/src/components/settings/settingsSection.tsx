import { Divider, Stack, Text, Title } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';

import { settingsSectionPropsSchema, SettingsSectionProps } from './props';
import { SettingsSectionProvider } from './settingsContext';
import { SETTINGS_SECTION } from '../../ids';

import type { SettingLevel } from './props';
import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The settings micro-app's translation namespace. Restated rather than imported: this renderer
 * runs inside whichever module owns the pane, and modules never import each other.
 */
const SETTINGS_NS = 'settings';

/**
 * The heading each level carries, owned here rather than by the module.
 *
 * Every pane must separate the three levels the same way and name them the same way -- a reader
 * has to be able to tell at a glance which of their settings are theirs, which their
 * organization's, and which the tenant's. Leaving the wording to each module would let two
 * modules disagree about what a level is called.
 */
const LEVEL_TITLE_KEYS: Record<SettingLevel, string> = {
	tenant: 'level.tenant',
	org: 'level.org',
	user: 'level.user',
};

/**
 * A titled group of settings, and the unit a module contributes as its `pages.settings` widget.
 *
 * It renders only the items its children declare. That is deliberate: the settings backend can
 * hold values a module is not ready to expose, and the visible set is the module's decision
 * rather than whatever the API happens to return.
 */
export const settingsSectionRenderer: IComponentRenderer<SettingsSectionProps> = {
	type: SETTINGS_SECTION,
	propsSchema: settingsSectionPropsSchema,
	render(props, runtime) {
		return <SettingsSection props={props} runtime={runtime} />;
	},
};

function SettingsSection({ props, runtime }: {
	props: SettingsSectionProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const t = useTranslate(props.translationNs);
	const tChrome = useTranslate(SETTINGS_NS);
	const contextValue = React.useMemo(
		() => ({ translationNs: props.translationNs, level: props.level }),
		[props.translationNs, props.level],
	);

	return (
		<SettingsSectionProvider value={contextValue}>
			<Stack
				gap='lg'
				{...componentAttrs(SETTINGS_SECTION)}
				{...testAttrs('ui.settingsSection', props.level)}
			>
				<Stack gap={4}>
					<Title order={3}>{tChrome(LEVEL_TITLE_KEYS[props.level])}</Title>
					<Divider />
					{/* A module's own sub-heading, if it groups its items further within the
						level. Subordinate to the level heading, never a replacement for it. */}
					{props.titleKey != null ? (
						<Title order={5} mt='xs'>{t(props.titleKey)}</Title>
					) : null}
					{props.descriptionKey != null ? (
						<Text size='sm' c='dimmed'>{t(props.descriptionKey)}</Text>
					) : null}
				</Stack>
				<Stack gap='md'>
					<MetaComponent node={runtime.children} />
				</Stack>
			</Stack>
		</SettingsSectionProvider>
	);
}
