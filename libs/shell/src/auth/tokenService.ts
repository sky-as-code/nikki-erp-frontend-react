import * as request from '@nikkierp/common/request';


const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type TokenObj = {
	token: string;
	expiresAt: number;
};

export const ErrRefreshTokenNotFound = new Error('No refresh token found');
export const ErrRefreshTokenExpired = new Error('Refresh token expired');

export class LocalStorageTokenService {

	public async getActiveAccessToken(): Promise<string | null> {
		let accessTokenObj: TokenObj | null;
		accessTokenObj = localStorage.getItem(ACCESS_TOKEN_KEY) as TokenObj | null;
		if (!accessTokenObj) return null;
		if (accessTokenObj.expiresAt < Date.now()) {
			accessTokenObj = await this._refreshAccessToken();
		};
		return accessTokenObj.token;
	}

	private async _refreshAccessToken(): Promise<TokenObj> {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) as TokenObj | null;
		if (!refreshToken) throw ErrRefreshTokenNotFound;
		if (refreshToken.expiresAt < Date.now()) throw ErrRefreshTokenExpired;

		const response = await request.post<TokenObj>('/refresh-token', {
			json: { refreshToken },
		});
		localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(response));
		return response;
	}

	public getAccessToken(): string {
		return localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
	}
}

export const tokenService = new LocalStorageTokenService();
