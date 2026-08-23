import { Group, Text } from '@mantine/core';
import { Button } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus, useEventBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { SETTINGS_SET_COMMAND, useSettingsData } from './settingsDataContext';

import type { SettingLevel } from './props';
import type { SettingsDataContextValue } from './settingsDataContext';
import type { ICommandBus } from '@nikkierp/common/commandBus';
import type { IEventBus } from '@nikkierp/common/eventBus';


const SETTINGS_NS = 'settings';

/**
 * Shell-owned commands for the copy of theme/language the chrome actually renders from.
 *
 * Restated as literals for the same reason the settings ids are: this file runs inside whichever
 * module owns the pane, and a module cannot import the Shell.
 */
const SHELL_GET_LOCAL_SETTINGS = 'shell.user_context.get_local_settings';
const SHELL_SET_LOCAL_SETTINGS = 'shell.user_context.set_local_settings';

/**
 * Announces that the Shell's mirrored settings changed.
 *
 * The command above writes the store, but the Shell's chrome renders from a *different* React
 * tree than the pane that saved -- a micro-app is mounted in its own root -- so the write alone
 * does not re-render it. The event bus is a single instance shared by every tree, which is what
 * carries the change across.
 */
const SHELL_LOCAL_SETTINGS_CHANGED = 'shell:local_settings:changed';

/** Settings whose stored value the Shell mirrors locally, keyed by the name the API uses. */
const SHELL_MIRRORED_SETTINGS: Record<string, 'themeMode' | 'languageCode'> = {
	theme_mode: 'themeMode',
	language: 'languageCode',
};

export type SettingsSaveBarProps = {
	/** The module being configured. Equal to that module's micro-app slug. */
	moduleKey: string,
	onSaved?: () => void,
};

/**
 * Saves the edits in a settings pane.
 *
 * One PATCH per level, carrying only the settings the user actually changed. Both halves matter:
 * the level is a path segment rather than a payload field, and an unchanged item left out of the
 * body is left untouched by the server. Since the write has no version check, sending the whole
 * pane would clobber every concurrent edit to settings this user never opened.
 */
export function SettingsSaveBar({ moduleKey, onSaved }: SettingsSaveBarProps): React.ReactNode {
	const t = useTranslate(SETTINGS_NS);
	const commandBus = useCommandBus();
	const eventBus = useEventBus();
	const data = useSettingsData();
	const [isSaving, setIsSaving] = React.useState(false);
	const [saveError, setSaveError] = React.useState<string | null>(null);

	// An override-only change is a real change: a tenant admin may lock a setting without touching
	// its value, and a Save that stayed disabled would silently discard that.
	const dirtyCount = (data?.drafts.size ?? 0) + (data?.overrideDrafts.size ?? 0);

	const onSave = React.useCallback(async () => {
		// Guards on the same count the button does. Testing `drafts` alone would let an
		// override-only change enable Save and then return here without saving it -- silently
		// discarding exactly the edit the `dirtyCount` comment above exists to preserve.
		if (!data || dirtyCount === 0) return;

		setIsSaving(true);
		setSaveError(null);

		const byLevel = buildSavePayload(data);

		try {
			const responses = await Promise.all([...byLevel].map(([level, items]) =>
				commandBus.publish({
					name: SETTINGS_SET_COMMAND,
					payload: { level, moduleKey, items },
				})));

			const failed = responses.find(r => r.error != null);
			const rejected = responses.flatMap(r => r.result?.clientErrors ?? []);
			if (failed) {
				setSaveError(String(failed.error));
			}
			else if (rejected.length > 0) {
				setSaveError(rejected.map(item => item.message).join('; '));
			}
			else {
				await syncShellLocalSettings(commandBus, eventBus, data.drafts);
				onSaved?.();
			}
		}
		catch (error: unknown) {
			setSaveError(error instanceof Error ? error.message : String(error));
		}
		finally {
			setIsSaving(false);
		}
	}, [commandBus, eventBus, data, dirtyCount, moduleKey, onSaved]);

	if (!data) return null;

	return (
		<Group justify='flex-end' gap='md'>
			{saveError != null ? <Text size='sm' c='red'>{saveError}</Text> : null}
			<Button
				onClick={() => void onSave()}
				disabled={dirtyCount === 0 || isSaving}
				loading={isSaving}
			>
				{t('page.save')}
			</Button>
		</Group>
	);
}


/**
 * Pushes a just-saved theme or language into the Shell's own copy.
 *
 * Without this the chrome keeps rendering the previous theme until a reload: the Shell mirrors
 * these two values at boot from `v1/iam/me/context` and has no reason to re-read them when
 * another module writes a setting.
 *
 * The whole `LocalSettings` object is sent, not just the changed key -- the command replaces the
 * stored value outright, so a partial payload would blank the field it does not name. This is the
 * opposite of the settings API's own partial-write rule, which is exactly why it is worth stating.
 */
async function syncShellLocalSettings(
	commandBus: ICommandBus,
	eventBus: IEventBus,
	drafts: Map<string, unknown>,
): Promise<void> {
	const changed: Record<string, unknown> = {};
	for (const [key, value] of drafts) {
		const name = key.slice(key.indexOf(':') + 1);
		const field = SHELL_MIRRORED_SETTINGS[name];
		if (field) changed[field] = value;
	}
	if (Object.keys(changed).length === 0) return;

	const current = await commandBus.publish<Record<string, unknown> | null>({
		name: SHELL_GET_LOCAL_SETTINGS,
	});
	const existing = current.result?.data ?? {};
	const next = { ...existing, ...changed };
	await commandBus.publish({
		name: SHELL_SET_LOCAL_SETTINGS,
		payload: next,
	});
	eventBus.publish(SHELL_LOCAL_SETTINGS_CHANGED, next);
}


type SetItem = {
	name: string,
	value: unknown,
	allow_override?: boolean,
};

/**
 * The value to send for one setting.
 *
 * A policy-only edit still has to carry a value: the write is an upsert of one row, and omitting
 * the value on a setting that has no row yet would leave the flag with nothing to attach to. The
 * currently displayed value is therefore resent unchanged, which is a no-op for that column.
 */
function valueFor(data: SettingsDataContextValue, key: string): unknown {
	if (data.drafts.has(key)) return data.drafts.get(key);
	return data.items.get(key)?.value ?? null;
}

/**
 * The PATCH payload for one save, grouped by level.
 *
 * Two rules live here, and both are correctness rather than tidiness:
 *
 * - **Only touched settings are sent.** Writes are last-write-wins with no version check (D17),
 *   so including an untouched item would clobber another user's concurrent edit to a field this
 *   user never looked at. The per-item dirty state *is* the safety mechanism.
 * - **Value and policy edits merge into one item.** They are two columns of the same row; sending
 *   them as two items would make the second overwrite the first.
 *
 * Grouped by level because each level is its own endpoint -- the level is a path segment, never
 * a payload field.
 */
export function buildSavePayload(data: SettingsDataContextValue): Map<SettingLevel, SetItem[]> {
	const byLevel = new Map<SettingLevel, SetItem[]>();
	const touched = new Set([...data.drafts.keys(), ...data.overrideDrafts.keys()]);

	for (const key of touched) {
		const separator = key.indexOf(':');
		const level = key.slice(0, separator) as SettingLevel;
		const name = key.slice(separator + 1);

		const entry: SetItem = { name, value: valueFor(data, key) };
		if (data.overrideDrafts.has(key)) {
			entry.allow_override = data.overrideDrafts.get(key);
		}
		const bucket = byLevel.get(level) ?? [];
		bucket.push(entry);
		byLevel.set(level, bucket);
	}

	return byLevel;
}
