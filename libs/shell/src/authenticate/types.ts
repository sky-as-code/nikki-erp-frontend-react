export const ErrRefreshTokenExpired = new Error('Refresh token expired');


export const SLICE_NAME = 'shell.authenticate';

export type AuthenticatedSession = {
	accessToken: string;
	accessTokenExpiresAt: number;
	refreshToken?: string;
	refreshTokenExpiresAt?: number;
};

export type SignInResult = {
	done: boolean;
	data?: AuthenticatedSession;
	nextStep?: string;
};

export type AuthenticatedCallback = (session: AuthenticatedSession) => void;

export interface ISignInStrategy {
	// Commence the sign in process. Each strategy implementation can have its own request and response definitions.
	startSignIn(params?: UnknownRecord): Promise<UnknownRecord>;
	continueSignIn(params?: UnknownRecord): Promise<SignInResult>;
	// onAuthenticated(callback: AuthenticatedCallback): void;
	refreshSession(refreshToken: string): Promise<AuthenticatedSession>;
	signOut(): Promise<void>;
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
	clear(): void;
}