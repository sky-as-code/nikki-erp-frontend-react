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