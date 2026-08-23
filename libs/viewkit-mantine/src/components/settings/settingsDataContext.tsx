import { useCommandBus } from '@nikkierp/ui/microApp';
import { PageContextProvider } from '@nikkierp/viewengine/render';
import React from 'react';

import type { SettingLevel } from './props';
import type { ModelSchemaField } from '@nikkierp/common/dynamicModel';


/**
 * Command ids owned by the settings micro-app.
 *
 * Restated here rather than imported: a module's settings pane runs inside its own bundle, and
 * modules never import each other. These strings are the contract, matched verbatim on both
 * sides -- they must stay in step with `modules/settings/src/features/settings/commands.ts`.
 */
const SETTINGS_GET_COMMAND = 'settings.settings.get_settings';
const SETTINGS_SET_COMMAND = 'settings.settings.set_settings';

/**
 * Marks the pane's subtree as a page for the view engine's benefit.
 *
 * Both fields are optional on `PageContextValue`; what matters to `MetaComponent` is only that a
 * context exists. There is no route path to give it -- the pane is mounted by another module's
 * page, not routed to.
 */
const PAGE_CONTEXT = { templateId: 'nikkierp.mantine.pages.settingsPane' };

/** One setting as the settings API returns it. Mirrors the backend's `SettingItemResponse`. */
export type SettingItemData = {
	name: string,
	level: SettingLevel,
	value: unknown,
	has_value: boolean,
	allow_override: boolean,
	/** Backend-computed. The control disables on this and never re-derives it. */
	editable: boolean,
	field?: ModelSchemaField,
};

type GetSettingsResponse = {
	module_key: string,
	/** The scope the caller is reading as. See `SettingsDataContextValue.ownerType`. */
	owner_type?: SettingLevel,
	items: SettingItemData[],
};

export type SettingsDataContextValue = {
	/** Loaded items keyed by `{level}:{name}`, so two levels can hold the same name. */
	items: Map<string, SettingItemData>,
	/** Values the user has edited but not saved, keyed the same way. */
	drafts: Map<string, unknown>,
	setDraft: (level: SettingLevel, name: string, value: unknown) => void,
	/**
	 * Unsaved override-policy changes, keyed the same way. Only a tenant admin can produce these:
	 * the API refuses the flag from anyone else rather than ignoring it.
	 *
	 * **Always empty today** -- the control that fed it was removed, because nothing on the
	 * response can identify a tenant admin (`settingsItem.tsx`, and `02-progress.md` for why).
	 * Kept because it is the correct shape and the save bar already merges a policy edit into the
	 * same item as its value; restoring the control is what fills it again.
	 */
	overrideDrafts: Map<string, boolean>,
	setOverrideDraft: (level: SettingLevel, name: string, allow: boolean) => void,
	/**
	 * What scope this actor is reading as, or null before the first response.
	 *
	 * `editable` cannot answer this: it is true at one's own level for a tenant admin and an
	 * ordinary user alike, so a pane deciding whether to offer tenant-only controls needs the
	 * scope itself. Taken from the response envelope rather than inferred.
	 */
	ownerType: SettingLevel | null,
	isLoading: boolean,
	loadError: string | null,
};

const SettingsDataContext = React.createContext<SettingsDataContextValue | null>(null);

/**
 * The loaded values behind a module's settings pane.
 *
 * Returns `null` outside a provider rather than throwing, because a pane rendered without one
 * should show its labels read-only rather than fail: the metadata is still valid, only the
 * values are missing.
 */
export function useSettingsData(): SettingsDataContextValue | null {
	return React.useContext(SettingsDataContext);
}

export function itemKey(level: SettingLevel, name: string): string {
	return `${level}:${name}`;
}

export type SettingsDataProviderProps = React.PropsWithChildren & {
	/** The module being configured. Equal to that module's micro-app slug. */
	moduleKey: string,
	/**
	 * Which levels to read.
	 *
	 * One request per level, because the level is a path segment rather than a payload field.
	 * A module registering at both user and org level needs both.
	 */
	levels: SettingLevel[],
};

/**
 * Loads a module's settings and holds the unsaved edits.
 *
 * Drafts are kept separately from loaded items rather than written over them. That separation is
 * what makes the partial save possible: only the names in `drafts` go in the PATCH, and an
 * untouched setting is never sent, so a concurrent edit to a setting this user never looked at
 * cannot be clobbered by their save. There is no version check on the write, so this is the
 * only thing protecting it.
 */
export function SettingsDataProvider(
	{ children, moduleKey, levels }: SettingsDataProviderProps,
): React.ReactNode {
	const commandBus = useCommandBus();
	const [items, setItems] = React.useState<Map<string, SettingItemData>>(() => new Map());
	const [drafts, setDrafts] = React.useState<Map<string, unknown>>(() => new Map());
	const [overrideDrafts, setOverrideDrafts] = React.useState<Map<string, boolean>>(() => new Map());
	const [ownerType, setOwnerType] = React.useState<SettingLevel | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);
	const [loadError, setLoadError] = React.useState<string | null>(null);

	// Joined so a caller passing a fresh array literal each render does not reload forever.
	const levelsKey = levels.join(',');

	React.useEffect(() => {
		let isMounted = true;
		const wanted = levelsKey.split(',').filter(Boolean) as SettingLevel[];

		setIsLoading(true);
		setLoadError(null);

		Promise.all(wanted.map(level => commandBus.publish<GetSettingsResponse>({
			name: SETTINGS_GET_COMMAND,
			payload: { level, moduleKey },
		}))).then((responses) => {
			if (!isMounted) return;

			const next = new Map<string, SettingItemData>();
			let scope: SettingLevel | null = null;
			for (const response of responses) {
				const data = response.result?.data;
				// Identical on every response -- the scope describes the caller, not the level
				// being read -- so the first one that reports it wins.
				if (scope == null && data?.owner_type != null) scope = data.owner_type;
				for (const item of data?.items ?? []) {
					next.set(itemKey(item.level, item.name), item);
				}
			}
			setItems(next);
			setOwnerType(scope);
			// Edits are dropped when the module or its levels change: a draft is keyed by a
			// setting that may not exist in what was just loaded.
			setDrafts(new Map());
			setOverrideDrafts(new Map());
			const failed = responses.find(r => r.error != null);
			setLoadError(failed ? String(failed.error) : null);
			setIsLoading(false);
		}).catch((error: unknown) => {
			if (!isMounted) return;
			setLoadError(error instanceof Error ? error.message : String(error));
			setIsLoading(false);
		});

		return () => {
			isMounted = false;
		};
	}, [commandBus, moduleKey, levelsKey]);

	const setDraft = React.useCallback((level: SettingLevel, name: string, value: unknown) => {
		setDrafts((previous) => {
			const next = new Map(previous);
			next.set(itemKey(level, name), value);
			return next;
		});
	}, []);

	const setOverrideDraft = React.useCallback(
		(level: SettingLevel, name: string, allow: boolean) => {
			setOverrideDrafts((previous) => {
				const next = new Map(previous);
				next.set(itemKey(level, name), allow);
				return next;
			});
		}, []);

	const value = React.useMemo<SettingsDataContextValue>(
		() => ({
			items, drafts, setDraft, overrideDrafts, setOverrideDraft,
			ownerType, isLoading, loadError,
		}),
		[items, drafts, setDraft, overrideDrafts, setOverrideDraft, ownerType, isLoading, loadError],
	);

	return (
		<SettingsDataContext.Provider value={value}>
			{/* A settings pane renders metadata but is not a page: it has no route and no
				template. `MetaComponent` skips any node outside a page context and returns null
				without a placeholder, so a pane without this renders as an empty column with
				nothing in the console. Established here rather than in each module's widget so
				that exposing a pane does not require knowing this. */}
			<PageContextProvider value={PAGE_CONTEXT}>
				{children}
			</PageContextProvider>
		</SettingsDataContext.Provider>
	);
}

export { SETTINGS_GET_COMMAND, SETTINGS_SET_COMMAND };
