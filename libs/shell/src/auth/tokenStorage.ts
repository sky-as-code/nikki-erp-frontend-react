import { decodeBase64, encodeBase64 } from '@nikkierp/common/utils';

import { TokenObj, ITokenStorage } from './types';


export class TokenSessionStorage implements ITokenStorage {
	readonly #key: string;

	constructor(key: string) {
		this.#key = key;
	}

	public setToken(token: TokenObj): void {
		setToken(this.#key, sessionStorage, token);
	}

	public getToken(): TokenObj | null {
		return getToken(this.#key, sessionStorage);
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
		setToken(this.#key, localStorage, token);
	}

	public getToken(): TokenObj | null {
		return getToken(this.#key, localStorage);
	}

	public clear(): void {
		clearToken(this.#key, localStorage);
	}
}

function setToken(key: string, storage: Storage, token: TokenObj): void {
	const json = JSON.stringify(token);
	const encoded = encodeBase64(json);
	storage.setItem(key, encoded);
}

function getToken(key: string, storage: Storage): TokenObj | null {
	const encoded = storage.getItem(key);
	if (!encoded) return null;
	const json = decodeBase64(encoded);
	return JSON.parse(json) as TokenObj;
}

function clearToken(key: string, storage: Storage): void {
	storage.removeItem(key);
}

export function getUserIdFromToken(token: string): string {
	const raw = token.trim();
	const parts = raw.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid JWT token format');
	}

	const payloadPart = parts[1];
	const decodedPayload = decodeBase64Url(payloadPart);
	const jsonPayload = JSON.parse(decodedPayload) as Record<string, unknown>;

	const userId = (jsonPayload.userid ?? jsonPayload.userId ?? jsonPayload.sub) as string | undefined;
	if (!userId) {
		throw new Error('User ID not found in token payload');
	}

	return userId;
}

function decodeBase64Url(base64Url: string): string {
	let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const pad = base64.length % 4;
	if (pad) {
		base64 += '='.repeat(4 - pad);
	}
	return atob(base64);
}