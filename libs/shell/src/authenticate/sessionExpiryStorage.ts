import { decodeBase64, encodeBase64 } from '@nikkierp/common/utils';

import { ISessionStorage, SessionExpiry } from './types';


export const SESSION_STORAGE_KEY = 'nikki_session';

/** Written by builds that kept the tokens in script reach; removed once so none outlives the upgrade. */
const LEGACY_TOKEN_KEYS = ['nikki_access_token', 'nikki_refresh_token'];

/**
 * The session's expiry times, in `localStorage` so a menu item opened in a new tab starts signed in.
 *
 * Holds no secret: the tokens are httpOnly cookies. It only tells the client when to refresh.
 */
export class SessionExpiryLocalStorage implements ISessionStorage {
	readonly #key: string;

	public constructor(key: string = SESSION_STORAGE_KEY) {
		this.#key = key;
	}

	public get(): SessionExpiry | null {
		try {
			const encoded = localStorage.getItem(this.#key);
			return encoded ? toSessionExpiry(JSON.parse(decodeBase64(encoded))) : null;
		}
		// A corrupt value is no session, not a crash at boot.
		catch {
			return null;
		}
	}

	public set(expiry: SessionExpiry): void {
		localStorage.setItem(this.#key, encodeBase64(JSON.stringify(expiry)));
	}

	public clear(): void {
		localStorage.removeItem(this.#key);
	}
}

export function removeLegacyTokenKeys(): void {
	try {
		LEGACY_TOKEN_KEYS.forEach(key => localStorage.removeItem(key));
	}
	catch {
		// Blocked storage holds no legacy token either.
	}
}

function toSessionExpiry(value: unknown): SessionExpiry | null {
	const record = value as Partial<SessionExpiry> | null;
	if (typeof record?.accessExpiresAt !== 'number' || typeof record.refreshExpiresAt !== 'number') {
		return null;
	}
	return { accessExpiresAt: record.accessExpiresAt, refreshExpiresAt: record.refreshExpiresAt };
}
