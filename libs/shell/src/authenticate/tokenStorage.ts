import { decodeBase64, encodeBase64 } from '@nikkierp/common/utils';

import { TokenObj, ITokenStorage } from './types';


export class TokenSessionStorage implements ITokenStorage {
	readonly #key: string;

	constructor(key: string) {
		this.#key = key;
	}

	public setToken(token: TokenObj): void {
		setToken(this.#key, sessionStorage, {
			token: token.token,
			expiresAt: token.expiresAt.getTime(),
		});
	}

	public getToken(): TokenObj | null {
		const serialized = getToken(this.#key, sessionStorage);
		if (!serialized) return null;
		return new TokenObj(serialized.token, serialized.expiresAt);
	}

	public clear(): void {
		clearToken(this.#key, sessionStorage);
	}
}

export class TokenLocalStorage implements ITokenStorage {
	readonly #key: string;

	constructor(key: string) {
		this.#key = key;
	}

	public setToken(token: TokenObj): void {
		setToken(this.#key, localStorage, {
			token: token.token,
			expiresAt: token.expiresAt.getTime(),
		});
	}

	public getToken(): TokenObj | null {
		const serialized = getToken(this.#key, localStorage);
		if (!serialized) return null;
		return new TokenObj(serialized.token, serialized.expiresAt);
	}

	public clear(): void {
		clearToken(this.#key, localStorage);
	}
}

type SerializedTokenObj = {
	token: string;
	expiresAt: number;
};

function setToken(key: string, storage: Storage, token: SerializedTokenObj): void {
	const json = JSON.stringify(token);
	const encoded = encodeBase64(json);
	storage.setItem(key, encoded);
}

function getToken(key: string, storage: Storage): SerializedTokenObj | null {
	const encoded = storage.getItem(key);
	if (!encoded) return null;
	const json = decodeBase64(encoded);
	return JSON.parse(json) as SerializedTokenObj;
}

function clearToken(key: string, storage: Storage): void {
	storage.removeItem(key);
}

// export function getUserIdFromToken(token: string): string {
// 	const raw = token.trim();
// 	const parts = raw.split('.');
// 	if (parts.length !== 3) {
// 		throw new Error('Invalid JWT token format');
// 	}

// 	const payloadPart = parts[1];
// 	const decodedPayload = decodeBase64Url(payloadPart);
// 	const jsonPayload = JSON.parse(decodedPayload) as Record<string, unknown>;

// 	const userId = (jsonPayload.userid ?? jsonPayload.userId ?? jsonPayload.sub) as string | undefined;
// 	if (!userId) {
// 		throw new Error('User ID not found in token payload');
// 	}

// 	return userId;
// }

// function decodeBase64Url(base64Url: string): string {
// 	let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
// 	const pad = base64.length % 4;
// 	if (pad) {
// 		base64 += '='.repeat(4 - pad);
// 	}
// 	return atob(base64);
// }