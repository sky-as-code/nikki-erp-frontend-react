/**
 * The save contract between a settings page and the module panes it hosts.
 *
 * The page owns the Save button -- once per page, top-left in its header, like every other page
 * template -- but the edits live in the pane, which is another module's widget in another bundle
 * and React tree. The two share only the event bus, so these names and payloads are the contract.
 * A custom non-CRUD page hosting widgets from other modules wires its header the same way.
 */
export const SETTINGS_SAVE_STATE_EVENT = 'settings:save_state';
export const SETTINGS_SAVE_REQUEST_EVENT = 'settings:save_request';

/** Published by a pane on mount and on every change; `moduleKey` names the pane. */
export type SettingsSaveState = {
	moduleKey: string,
	dirty: boolean,
	saving: boolean,
	locked: boolean,
	lockedMissing: string[],
	error: string | null,
};

/** Published by the page's Save button; only the pane with this `moduleKey` acts on it. */
export type SettingsSaveRequest = {
	moduleKey: string,
};
