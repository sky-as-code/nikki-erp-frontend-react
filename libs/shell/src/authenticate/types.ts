export const ErrRefreshTokenExpired = new Error('Refresh token expired');


export const SLICE_NAME = 'shell.authenticate';

export interface ISignInStrategy {
	// Commence the sign in process. Each strategy implementation can have its own request and response definitions.
	startSignIn(params: StartSignInParams): Promise<StartSignInResult>;
	continueSignIn(params: SignInParams): Promise<SignInResult>;
	// onAuthenticated(callback: AuthenticatedCallback): void;
	refreshSession(params: RefreshTokenParams): Promise<AuthenticatedSession>;
	signOut(): Promise<void>;
}

export type AuthenticatedSession = {
	accessToken: string,
	accessTokenExpiresAt: string,
	refreshToken?: string,
	refreshTokenExpiresAt?: string,
};

export type SignInResult = {
	done: boolean,
	data?: AuthenticatedSession,
	nextStep?: string,
};

export type StartSignInParams = {
	principalType?: string,
	username: string,
};

export type StartSignInResult = {
	attemptId: string,
	createdAt: string,
	currentMethod: string,
	expiresAt: string,
	methods: string[],
	principalName: string,
};

export type SignInParams = {
	attemptId: string,
	passwords: Record<string, unknown>,
};

export type RefreshTokenParams = {
	refreshToken: string,
};

export type AuthenticatedCallback = (session: AuthenticatedSession) => void;

export class TokenObj {
	#token: string;
	#expiresAt: Date;

	public constructor(token: string, expiresAt: string | number) {
		this.#token = token;
		this.#expiresAt = new Date(expiresAt);
	}

	public get isExpired(): boolean {
		return this.#expiresAt.getTime() < Date.now();
	}

	public get token(): string {
		return this.#token;
	}

	public get expiresAt(): Date {
		return this.#expiresAt;
	}
};

export interface ITokenStorage {
	getToken(): TokenObj | null;
	setToken(token: TokenObj): void;
	clear(): void;
}