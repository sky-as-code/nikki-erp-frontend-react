import { Group, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';

import { settingsItemPropsSchema, SettingsItemProps } from './props';
import { SettingControl } from './settingControl';
import { defaultSettingDescriptionKey, useSettingsSectionContext } from './settingsContext';
import { itemKey, useSettingsData } from './settingsDataContext';
import { SETTINGS_ITEM } from '../../ids';

import type { SettingItemData } from './settingsDataContext';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The settings micro-app's translation namespace, restated rather than imported: modules never
 * import each other, and this renderer runs inside whichever module owns the pane.
 */
const SETTINGS_NS = 'settings';

/**
 * One configurable setting: its label, its explanation, and the control bound to it.
 *
 * The node carries only *which* setting this is -- name, level, and how to label it. The value
 * itself is not in the metadata, because metadata must survive a JSON round trip and a live
 * value would not. The control reads and writes through the settings API instead.
 */
export const settingsItemRenderer: IComponentRenderer<SettingsItemProps> = {
	type: SETTINGS_ITEM,
	propsSchema: settingsItemPropsSchema,
	render(props) {
		return <SettingsItem props={props} />;
	},
};

function SettingsItem({ props }: { props: SettingsItemProps }): React.ReactNode {
	const { translationNs, level } = useSettingsSectionContext();
	// Two namespaces: the module's own for this setting's label and description, and the settings
	// module's for the chrome around it. The lock caption belongs to the settings module because
	// it says the same thing for every module's pane.
	const t = useTranslate(translationNs);
	const tChrome = useTranslate(SETTINGS_NS);
	const data = useSettingsData();

	// Falls back to the key the backend declares for this setting, so a module that adds a
	// setting gets its sentence without restating the key here.
	const descriptionKey = props.descriptionKey ?? defaultSettingDescriptionKey(props.name);

	const key = itemKey(level, props.name);
	const item = data?.items.get(key);
	// The draft wins over the loaded value, but only when one exists: `has(key)` rather than a
	// nullish check, because clearing a setting stores a real `null` the user chose.
	const value = data?.drafts.has(key) ? data.drafts.get(key) : item?.value;

	const lockKey = item ? lockReasonKey(item) : null;

	return (
		<Group
			justify='space-between' align='flex-start' wrap='nowrap' gap='xl'
			{...componentAttrs(SETTINGS_ITEM)}
			{...testAttrs('ui.settingsItem', props.name)}
		>
			<Stack gap={2} style={{ flex: 1 }}>
				<Text fw={500}>{t(props.labelKey)}</Text>
				<Text size='sm' c='dimmed'>{t(descriptionKey)}</Text>
			</Stack>
			{item != null && data != null ? (
				// The caption sits beside the control, not under the label: it explains why *this
				// control* is inert, and the mock puts it there for that reason.
				<Group gap='xs' align='center' wrap='nowrap'>
					<SettingControl
						item={item}
						value={value}
						onChange={next => data.setDraft(level, props.name, next)}
					/>
					{lockKey != null ? (
						<Text
							size='xs' c='dimmed' fs='italic'
							{...testAttrs('ui.settingsItem.lock', props.name)}
						>
							{tChrome(lockKey)}
						</Text>
					) : null}
				</Group>
			) : null}
		</Group>
	);
}

/**
 * Why this item is not editable, or `null` when it is.
 *
 * The backend reports `editable` as one boolean but computes it from two unrelated causes
 * (`settings_read_domservice.go`, `isEditable`): the actor is not at this item's level, or the
 * schema forbids overriding and the tenant's value stands. Only the second is "managed by your
 * tenant administrator" -- saying that about the first would blame a policy for what is really
 * this actor's scope, so `allow_override` is what separates them.
 */
export function lockReasonKey(item: SettingItemData): string | null {
	if (item.editable) return null;
	return item.allow_override ? 'settings.notEditable' : 'settings.enforcedByTenant';
}

/*
 * There is deliberately no override-policy control here.
 *
 * It was built and then removed: the rule it needs is "only a tenant admin, and only for the
 * levels below them", and **nothing on the response can currently identify a tenant admin**.
 * `owner_type` looks like that signal and is not -- each per-level app service passes its own
 * level as the owner type (`settings_appservices.go`), so it merely echoes the path segment.
 * Gating on it showed the control to nobody; not gating would show it to everybody.
 *
 * The write path stays ready for it: the API accepts `allow_override` per item and refuses it
 * from a non-tenant caller rather than ignoring it. What is missing is the actor's real scope,
 * which belongs to the deferred authorization work -- see `02-progress.md`.
 */
