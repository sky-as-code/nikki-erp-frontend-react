import * as request from '@nikkierp/common/request';
import { dispatchServiceMethod, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import {
	GetUserContextResponse, LocalSettings, LOCAL_SETTINGS_STORAGE_KEY, SLICE_NAME, toUserContext, UserContext,
} from './types';
import { shellStore } from '../appState/shellStore';

/** The theme/language the user last chose, restored from `localStorage` on boot. */
function loadSavedLocalSettings(): LocalSettings {
	const settingsStr = localStorage.getItem(LOCAL_SETTINGS_STORAGE_KEY);
	if (!settingsStr) return { languageCode: null, themeMode: 'light' };
	return JSON.parse(atob(settingsStr)) as LocalSettings;
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
	 * Fetches the user context and mirrors the server's language/theme into local settings.
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
