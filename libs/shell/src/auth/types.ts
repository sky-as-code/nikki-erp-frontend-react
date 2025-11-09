export const ErrRefreshTokenExpired = new Error('Refresh token expired');


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
	startSignIn(params?: UnknownRecord): Promise<UnknownRecord>;
	continueSignIn(params?: UnknownRecord): Promise<SignInResult>;
	onAuthenticated(callback: AuthenticatedCallback): void;
	refreshSession(refreshToken: string): Promise<AuthenticatedSession>;
}

export class TokenObj {
	public constructor(
		public readonly token: string,
		public readonly expiresAt: number,
	) {
	}

	public get isExpired(): boolean {
		return this.expiresAt < Date.now();
	}
};

export interface ITokenStorage {
	getToken(): TokenObj | null;
	setToken(token: TokenObj): void;
}