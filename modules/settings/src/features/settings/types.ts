import type { ModelSchemaField } from '@nikkierp/common/dynamicModel';
import type { SettingLevel } from '@nikkierp/viewkit-mantine/props';


export type { SettingLevel };

/**
 * One setting as the settings API returns it.
 *
 * Mirrors the backend's `SettingItemResponse` verbatim
 * (`modules/settings/transport/restful/v1/settings_dto.go`). Field names are snake_case because
 * they are the wire shape, not a frontend model.
 */
export type SettingItem = {
	name: string,
	level: SettingLevel,
	value: unknown,
	/**
	 * False when no row exists for this owner yet and `value` came from the schema's declared
	 * default. A default is not a stored choice, so the two must not be collapsed.
	 */
	has_value: boolean,
	/**
	 * Schema metadata rather than per-record state. False means an owner below the tenant may not
	 * keep its own value.
	 */
	allow_override: boolean,
	/**
	 * Whether this actor may change the item. Computed by the backend from the level and
	 * `allow_override` together -- the frontend disables the control on this and never re-derives
	 * it, because a locked setting shown as editable lets a user submit a change the server then
	 * refuses.
	 */
	editable: boolean,
	/**
	 * The declaration the value was validated against, in the same shape the dynamic schema
	 * endpoints return. Present unless the setting has no declaration to report.
	 */
	field?: ModelSchemaField,
};

export type GetSettingsRequest = {
	level: SettingLevel,
	/** The module whose settings are read. Equal to that module's micro-app slug. */
	moduleKey: string,
};

export type GetSettingsResponse = {
	module_key: string,
	items: SettingItem[],
};

export type SetSettingItem = {
	name: string,
	value: unknown,
};

export type SetSettingsRequest = {
	level: SettingLevel,
	moduleKey: string,
	/**
	 * Only the items the caller changed.
	 *
	 * An absent item is left untouched rather than cleared, and there is no version check on the
	 * write (D17), so sending an unchanged item is how a concurrent edit to a setting this caller
	 * never touched gets clobbered. Sending the whole pane would make every save a collision.
	 */
	items: SetSettingItem[],
};

export type SetSettingsResponse = {
	/** Rows written, including any children an enforced tenant setting fanned out onto. */
	updated: number,
};
