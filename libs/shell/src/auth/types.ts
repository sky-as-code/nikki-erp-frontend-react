export type AuthenticatedSession = {
	accessToken: string;
	accessTokenExpiresAt: number;

	// TODO: Store refresh token in secured cookie.
	refreshToken?: string;
	refreshTokenExpiresAt?: number;
};

export type SignInResult = UnknownRecord & {
	done: boolean;
	data?: AuthenticatedSession;
};

export type AuthenticatedCallback = (session: AuthenticatedSession) => void;

export interface ISignInStrategy {
	start(params?: UnknownRecord): Promise<UnknownRecord>;
	continue(params?: UnknownRecord): Promise<SignInResult>;
	onAuthenticated(callback: AuthenticatedCallback): void;
}

export type AccessToken = {
	accessToken: string;
	accessTokenExpiresAt: number;
};

export interface ITokenService {
	getAccessToken(): AccessToken | null;
	setAccessToken(token: AccessToken): void;
}