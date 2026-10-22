import { CommandBus } from '@nikkierp/common/commandBus';

import type { FormatDefaults } from '../Localized/formatDefaults';


export const DEFAULT_USER_SETTINGS_COMMAND = 'shell.user_context.get';

export type ValueRenderersConfig = {
	/** Command answering with the acting user's context (`accountSettings.language` and `.currency`). */
	userSettingsCommand?: string,
};

/** The slice of the Shell's `UserContext` the renderers read; declared here since `ui` sits below the Shell. */
export type UserSettingsResponse = {
	accountSettings?: {
		language?: { isoCode?: string, decimalSeparator?: string, thousandsSeparator?: string },
		currency?: { code: string, symbol: string, decimalPlaces: number },
	},
} | null;

let userSettingsCommand = DEFAULT_USER_SETTINGS_COMMAND;
let cached: Promise<FormatDefaults> | undefined;

/**
 * Names the command the renderers read user settings from. The default keeps a micro-app's own
 * bundled copy of this library working without the Shell ever configuring it.
 */
export function configureValueRenderers(config: ValueRenderersConfig): void {
	userSettingsCommand = config.userSettingsCommand ?? DEFAULT_USER_SETTINGS_COMMAND;
	cached = undefined;
}

/** Forgets the fetched settings, e.g. after the user changed their language or currency. */
export function resetValueRendererSettings(): void {
	cached = undefined;
}

/**
 * The user's formatting settings over the command bus, fetched once per bundle copy.
 *
 * A context the Shell has not loaded yet answers `null`; that answer is not cached, so the next
 * render asks again instead of formatting on `Intl` defaults for the rest of the session.
 */
export function fetchValueFormatDefaults(): Promise<FormatDefaults> {
	if (!cached) {
		const pending = loadFormatDefaults();
		cached = pending;
		pending.then(
			(defaults) => {
				if (!defaults.locale && cached === pending) {
					cached = undefined;
				}
			},
			() => {
				if (cached === pending) {
					cached = undefined;
				}
			},
		);
	}
	return cached;
}

async function loadFormatDefaults(): Promise<FormatDefaults> {
	const bus = CommandBus.instance;
	if (!bus) {
		return {};
	}
	const response = await bus.publish<UserSettingsResponse>({ name: userSettingsCommand });
	return toFormatDefaults(response.result?.data ?? null);
}

export function toFormatDefaults(context: UserSettingsResponse): FormatDefaults {
	const settings = context?.accountSettings;
	if (!settings?.language?.isoCode) {
		return {};
	}
	return {
		locale: settings.language.isoCode,
		decimalSeparator: settings.language.decimalSeparator || undefined,
		thousandsSeparator: settings.language.thousandsSeparator || undefined,
		currency: settings.currency,
	};
}
