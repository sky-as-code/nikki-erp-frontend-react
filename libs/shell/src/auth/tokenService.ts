import { decodeBase64, encodeBase64 } from '@nikkierp/common/utils';

import { AccessToken, ITokenService } from './types';


const ACCESS_TOKEN_KEY = 'accessToken';

// export const ErrRefreshTokenNotFound = new Error('No refresh token found');
// export const ErrRefreshTokenExpired = new Error('Refresh token expired');

export class SessionStorageTokenService implements ITokenService {
	public setAccessToken(token: AccessToken): void {
		const json = JSON.stringify(token);
		const encoded = encodeBase64(json);
		sessionStorage.setItem(ACCESS_TOKEN_KEY, encoded);
	}

	public getAccessToken(): AccessToken | null {
		const encoded = sessionStorage.getItem(ACCESS_TOKEN_KEY);
		if (!encoded) return null;
		const json = decodeBase64(encoded);
		return JSON.parse(json) as AccessToken;
	}
}
