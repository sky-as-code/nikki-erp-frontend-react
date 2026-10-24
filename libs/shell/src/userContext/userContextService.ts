import * as request from '@nikkierp/common/request';
import { dispatchServiceMethod, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import {
	DEFAULT_LOCAL_SETTINGS, GetUserContextResponse, LocalSettings, LOCAL_SETTINGS_STORAGE_KEY, SLICE_NAME, toDensity,
	toUserContext, UserContext,
} from './types';
import { shellStore } from '../appState/shellStore';

/**
 * The theme/density/language the user last chose, restored from `localStorage` on boot.
 *
 * This is also what the sign-in page shows: the value survives sign-out on purpose.
 */
export function loadSavedLocalSettings(): LocalSettings {
	const fallback = DEFAULT_LOCAL_SETTINGS;
	try {
		const settingsStr = localStorage.getItem(LOCAL_SETTINGS_STORAGE_KEY);
		if (!settingsStr) return fallback;
		const saved = JSON.parse(atob(settingsStr)) as Partial<LocalSettings>;
		return {
			languageCode: saved.languageCode ?? fallback.languageCode,
			themeMode: saved.themeMode ?? fallback.themeMode,
			// Narrowed: a value stored before density existed, or by an older build, has none.
			density: toDensity(saved.density),
		};
	}
	// A corrupt value or blocked storage must not take the whole Shell down at boot.
	catch {
		return fallback;
	}
}

/**
 * Seeds `setLocalSettings` from `localStorage`.
 *
 * The **full** method-state shape has to be spread, not just `data`: the generated
 * reducers mutate `state[methodName].status` in place, so a partial object would leave
 * those keys `undefined`.
 */
function buildInitialState() {
	return {
		setLocalSettings: {
			status: null,
			data: typeof localStorage === 'undefined' ? null : loadSavedLocalSettings(),
			clientErrors: [],
			error: null,
			doneAt: 0,
		},
	};
}

/** The signed-in user, their organizations, and their account/local settings. */
@storeService(SLICE_NAME, shellStore, { initialState: buildInitialState() })
export class UserContextService {
	/**
	 * Fetches the user context and mirrors the server's language/theme/density into local settings.
	 *
	 * `setLocalSettings` is dispatched rather than called. `@storeService` installs bound
	 * copies of the plain methods, so `this.setLocalSettings(...)` would write
	 * `localStorage` and return, leaving its own slice untouched — and `useLocalSettings`
	 * reads that slice, so the theme and language the server just supplied would not
	 * reach the UI until the next reload.
	 */
	@storeAsyncMethod
	public async getUserContext(): Promise<UserContext> {
		const data = request.unwrapResult(await request.get<GetUserContextResponse>('v1/iam/me/context'));
		const userContext = toUserContext(data);
		await dispatchServiceMethod(this.setLocalSettings, {
			languageCode: userContext.accountSettings.language.isoCode,
			themeMode: userContext.accountSettings.themeMode,
			density: userContext.accountSettings.density,
		});
		return userContext;
	}

	@storeAsyncMethod
	public async setLocalSettings(input: LocalSettings): Promise<LocalSettings> {
		localStorage.setItem(LOCAL_SETTINGS_STORAGE_KEY, btoa(JSON.stringify(input)));
		return input;
	}
}

export const userContextService = new UserContextService();
